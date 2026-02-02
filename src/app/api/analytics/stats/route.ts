import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin (server-side)
let db: ReturnType<typeof getDatabase> | null = null;

try {
    if (!getApps().length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount),
                databaseURL: 'https://otp-drotes-default-rtdb.firebaseio.com'
            });
        } else {
            initializeApp({
                databaseURL: 'https://otp-drotes-default-rtdb.firebaseio.com'
            });
        }
    }
    db = getDatabase();
} catch (e) {
    console.warn('[Analytics] Firebase Admin init failed:', e);
}

function getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDateNDaysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET() {
    try {
        if (!db) {
            return NextResponse.json({
                rightNow: 0,
                visitors24h: 0,
                visitors7d: 0,
                funnel: { viewing: 0, activeCarts: 0, checkingOut: 0, completed: 0 },
                locations: [],
                markers: [],
                pages: [],
                daily: { date: getTodayDate(), orders: 0, revenue: 0, uniqueVisitors: 0 },
                devices: { mobile: 0, desktop: 0 },
                recent: [],
                warning: 'Firebase not configured'
            });
        }

        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        const tenMinutesAgo = now - 10 * 60 * 1000;
        const today = getTodayDate();

        // Get live visitors
        const liveSnapshot = await db.ref('visitors/live').once('value');
        const liveData = liveSnapshot.val() || {};

        // Filter active visitors (last 5 minutes)
        const activeVisitors: any[] = [];
        for (const visitor of Object.values(liveData)) {
            const v = visitor as any;
            if (v.lastBeat > fiveMinutesAgo) {
                activeVisitors.push(v);
            }
        }

        // Get 24h and 7d visitor counts from history
        let visitors24h = 0;
        let visitors7d = 0;
        const uniqueIds24h = new Set<string>();
        const uniqueIds7d = new Set<string>();

        for (let i = 0; i < 7; i++) {
            const dateKey = getDateNDaysAgo(i);
            const historySnapshot = await db.ref(`visitors/history/${dateKey}`).once('value');
            const historyData = historySnapshot.val() || {};

            for (const visitorId of Object.keys(historyData)) {
                uniqueIds7d.add(visitorId);
                if (i === 0) {
                    uniqueIds24h.add(visitorId);
                }
            }
        }
        visitors24h = uniqueIds24h.size;
        visitors7d = uniqueIds7d.size;

        // Funnel (last 10 minutes)
        const recentVisitors = Object.values(liveData).filter((v: any) => v.lastBeat > tenMinutesAgo) as any[];
        const funnel = {
            viewing: recentVisitors.filter(v => v.action === 'view').length,
            activeCarts: recentVisitors.filter(v => v.action === 'cart').length,
            checkingOut: recentVisitors.filter(v => v.action === 'checkout').length,
            completed: recentVisitors.filter(v => v.action === 'complete').length
        };

        // Location breakdown
        const locationMap: Record<string, any> = {};
        for (const visitor of activeVisitors) {
            if (!locationMap[visitor.country]) {
                locationMap[visitor.country] = {
                    count: 0,
                    countryName: visitor.countryName,
                    lat: visitor.lat,
                    lng: visitor.lng,
                    visitors: []
                };
            }
            locationMap[visitor.country].count++;
            locationMap[visitor.country].visitors.push({
                id: visitor.id?.slice(0, 8) || 'unknown',
                ip: visitor.ip,
                city: visitor.city,
                path: visitor.path
            });
        }

        // Globe markers
        const markers = activeVisitors.map(v => ({
            location: [v.lat, v.lng],
            size: 0.06
        }));

        // Daily stats
        const dailyStatsSnapshot = await db.ref(`visitors/dailyStats/${today}`).once('value');
        const dailyStats = dailyStatsSnapshot.val() || { orders: 0, revenue: 0 };

        // Pages
        const pageMap: Record<string, number> = {};
        for (const visitor of activeVisitors) {
            pageMap[visitor.path] = (pageMap[visitor.path] || 0) + 1;
        }

        return NextResponse.json({
            rightNow: activeVisitors.length,
            visitors24h,
            visitors7d,
            funnel,
            locations: Object.entries(locationMap)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([code, data]) => ({
                    code,
                    name: data.countryName,
                    count: data.count,
                    lat: data.lat,
                    lng: data.lng,
                    visitors: data.visitors
                })),
            markers,
            pages: Object.entries(pageMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([path, count]) => ({ path, count })),
            daily: {
                date: today,
                orders: dailyStats.orders || 0,
                revenue: dailyStats.revenue || 0,
                uniqueVisitors: visitors24h
            },
            devices: {
                mobile: activeVisitors.filter(v => v.device === 'mobile').length,
                desktop: activeVisitors.filter(v => v.device === 'desktop').length
            },
            recent: activeVisitors
                .sort((a, b) => b.lastBeat - a.lastBeat)
                .slice(0, 8)
                .map(v => ({
                    id: v.id?.slice(0, 8) || 'unknown',
                    country: v.countryName,
                    action: v.action,
                    path: v.path,
                    ago: Math.round((now - v.lastBeat) / 1000)
                }))
        }, {
            headers: { 'Cache-Control': 'no-store, max-age=0' }
        });

    } catch (error) {
        console.error('[Analytics] Stats error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

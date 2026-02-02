import { NextResponse } from 'next/server';

const FIREBASE_DB_URL = 'https://otp-drotes-default-rtdb.firebaseio.com';

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
        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        const tenMinutesAgo = now - 10 * 60 * 1000;
        const today = getTodayDate();

        // Parallel fetch for speed
        const [liveRes, dailyStatsRes] = await Promise.all([
            fetch(`${FIREBASE_DB_URL}/visitors/live.json`),
            fetch(`${FIREBASE_DB_URL}/visitors/dailyStats/${today}.json`)
        ]);

        const liveData = await liveRes.json() || {};
        const dailyStats = await dailyStatsRes.json() || { orders: 0, revenue: 0 };

        // Active Visitors
        const activeVisitors: any[] = [];
        const recentVisitors: any[] = []; // For funnel

        for (const visitor of Object.values(liveData)) {
            const v = visitor as any;
            if (v.lastBeat > fiveMinutesAgo) {
                activeVisitors.push(v);
            }
            if (v.lastBeat > tenMinutesAgo) {
                recentVisitors.push(v);
            }
        }

        // Funnel
        const funnel = {
            viewing: recentVisitors.filter(v => v.action === 'view').length,
            activeCarts: recentVisitors.filter(v => v.action === 'cart').length,
            checkingOut: recentVisitors.filter(v => v.action === 'checkout').length,
            completed: recentVisitors.filter(v => v.action === 'complete').length
        };

        // Location Breakdown
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

        // Markers
        const markers = activeVisitors.map(v => ({
            location: [v.lat, v.lng],
            size: 0.06
        }));

        // Pages
        const pageMap: Record<string, number> = {};
        for (const visitor of activeVisitors) {
            pageMap[visitor.path] = (pageMap[visitor.path] || 0) + 1;
        }

        // Calculate 24h & 7d counts (Fetch latest 7 days history concurrently)
        // Optimized: Only fetch if requested explicitly or cache? 
        // For now, let's fetch strictly today's history for unique visitors count as a baseline
        // Fetching 7 days might be slow via REST if data is large. 
        // Strategy: Use today's history for "Daily Unique", and return 0 for others to keep it fast
        // Or fetch strictly just the count via .json?shallow=true (Firebase functionality) - shallow doesn't give counts directly but keys.

        // Fetching just today's history for unique visitors count
        const historyRes = await fetch(`${FIREBASE_DB_URL}/visitors/history/${today}.json?shallow=true`);
        const historyKeys = await historyRes.json() || {};
        const uniqueVisitorsToday = Object.keys(historyKeys).length;

        // Dummy 24h/7d for now to ensure speed, can be enhanced later or fetched client-side lazy
        const visitors24h = uniqueVisitorsToday;
        const visitors7d = uniqueVisitorsToday;

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
                uniqueVisitors: uniqueVisitorsToday
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

import { NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/lib/redis';

interface Visitor {
    id: string;
    lastBeat: number;
    country: string;
    countryName: string;
    city: string;
    lat: number;
    lng: number;
    path: string;
    action: 'view' | 'cart' | 'checkout' | 'complete';
    cartItems: number;
    device: 'mobile' | 'desktop';
    ip: string;
}

interface HistoricalVisit {
    visitorId: string;
    timestamp: number;
    country: string;
    countryName: string;
    ip: string;
}

function getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function GET() {
    try {
        // Check Redis availability
        if (!redis) {
            console.warn('[Analytics] Redis not configured');
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
                warning: 'Redis not configured'
            });
        }

        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        const tenMinutesAgo = now - 10 * 60 * 1000;
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Get all visitors from Redis hash
        const rawVisitors = await redis.hgetall(REDIS_KEYS.VISITORS);
        const allVisitors: Visitor[] = [];

        for (const v of Object.values(rawVisitors || {})) {
            try {
                const parsed = typeof v === 'string' ? JSON.parse(v) : v as Visitor;
                allVisitors.push(parsed);
            } catch { }
        }

        // Filter active visitors (last 5 minutes)
        const activeVisitors = allVisitors.filter(v => v.lastBeat > fiveMinutesAgo);

        // Get historical visits for 24h/7d counts
        const historicalRaw = await redis.lrange(REDIS_KEYS.HISTORICAL, 0, 9999);
        const historicalVisits: HistoricalVisit[] = [];

        for (const h of historicalRaw || []) {
            try {
                const parsed = typeof h === 'string' ? JSON.parse(h) : h as HistoricalVisit;
                historicalVisits.push(parsed);
            } catch { }
        }

        const visitors24h = new Set(
            historicalVisits
                .filter(v => v.timestamp > twentyFourHoursAgo)
                .map(v => v.visitorId)
        ).size;

        const visitors7d = new Set(
            historicalVisits
                .filter(v => v.timestamp > sevenDaysAgo)
                .map(v => v.visitorId)
        ).size;

        // Behavioral funnel (last 10 minutes)
        const recentVisitors = allVisitors.filter(v => v.lastBeat > tenMinutesAgo);
        const funnel = {
            viewing: recentVisitors.filter(v => v.action === 'view').length,
            activeCarts: recentVisitors.filter(v => v.action === 'cart').length,
            checkingOut: recentVisitors.filter(v => v.action === 'checkout').length,
            completed: recentVisitors.filter(v => v.action === 'complete').length
        };

        // Location breakdown
        const locationMap: Record<string, {
            count: number;
            countryName: string;
            lat: number;
            lng: number;
            visitors: { id: string; ip: string; city: string; path: string }[];
        }> = {};

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
                id: visitor.id.slice(0, 8),
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

        // Daily stats from Redis
        const today = getTodayDate();
        const dailyKey = `${REDIS_KEYS.DAILY_STATS}:${today}`;
        const dailyData = await redis.hgetall(dailyKey);
        const uniqueVisitorCount = await redis.scard(`${dailyKey}:visitors`);

        // Active pages
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
                orders: parseInt(String(dailyData?.orders || 0)),
                revenue: parseFloat(String(dailyData?.revenue || 0)),
                uniqueVisitors: uniqueVisitorCount || 0
            },
            devices: {
                mobile: activeVisitors.filter(v => v.device === 'mobile').length,
                desktop: activeVisitors.filter(v => v.device === 'desktop').length
            },
            recent: activeVisitors
                .sort((a, b) => b.lastBeat - a.lastBeat)
                .slice(0, 8)
                .map(v => ({
                    id: v.id.slice(0, 8),
                    country: v.countryName,
                    action: v.action,
                    path: v.path,
                    ago: Math.round((now - v.lastBeat) / 1000)
                }))
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0'
            }
        });

    } catch (error) {
        console.error('[Analytics] Stats error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

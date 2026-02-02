import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/analytics-live.json');

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

interface AnalyticsData {
    visitors: Record<string, Visitor>;
    dailyStats: {
        date: string;
        orders: number;
        revenue: number;
        visitors: string[];
    };
    historicalVisits: HistoricalVisit[];
}

async function readData(): Promise<AnalyticsData> {
    try {
        const content = await fs.readFile(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return {
            visitors: parsed.visitors || {},
            dailyStats: parsed.dailyStats || { date: '', orders: 0, revenue: 0, visitors: [] },
            historicalVisits: parsed.historicalVisits || []
        };
    } catch {
        return {
            visitors: {},
            dailyStats: { date: '', orders: 0, revenue: 0, visitors: [] },
            historicalVisits: []
        };
    }
}

function getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function GET() {
    try {
        const data = await readData();
        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        const tenMinutesAgo = now - 10 * 60 * 1000;
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Filter active visitors (last 5 minutes for "Right Now")
        const activeVisitors: Visitor[] = [];
        for (const visitor of Object.values(data.visitors)) {
            if (visitor.lastBeat > fiveMinutesAgo) {
                activeVisitors.push(visitor);
            }
        }

        // Historical visitor counts from historicalVisits array
        const visitors24h = new Set(
            data.historicalVisits
                .filter(v => v.timestamp > twentyFourHoursAgo)
                .map(v => v.visitorId)
        ).size;

        const visitors7d = new Set(
            data.historicalVisits
                .filter(v => v.timestamp > sevenDaysAgo)
                .map(v => v.visitorId)
        ).size;

        // Behavioral funnel (last 10 minutes)
        const recentVisitors = Object.values(data.visitors).filter(v => v.lastBeat > tenMinutesAgo);
        const funnel = {
            viewing: recentVisitors.filter(v => v.action === 'view').length,
            activeCarts: recentVisitors.filter(v => v.action === 'cart').length,
            checkingOut: recentVisitors.filter(v => v.action === 'checkout').length,
            completed: recentVisitors.filter(v => v.action === 'complete').length
        };

        // Location breakdown with visitor IPs for detail view
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

        // Convert to array format for globe markers
        const markers = activeVisitors.map(v => ({
            location: [v.lat, v.lng],
            size: 0.06
        }));

        // Daily stats with date check
        const today = getTodayDate();
        let dailyStats = data.dailyStats;
        if (dailyStats.date !== today) {
            dailyStats = { date: today, orders: 0, revenue: 0, visitors: [] };
        }

        // Active pages
        const pageMap: Record<string, number> = {};
        for (const visitor of activeVisitors) {
            pageMap[visitor.path] = (pageMap[visitor.path] || 0) + 1;
        }

        return NextResponse.json({
            // Real-time metrics
            rightNow: activeVisitors.length,

            // Historical visitor counts
            visitors24h,
            visitors7d,

            // Behavioral funnel (10 min)
            funnel,

            // Location data with visitor IPs
            locations: Object.entries(locationMap)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([code, data]) => ({
                    code,
                    name: data.countryName,
                    count: data.count,
                    lat: data.lat,
                    lng: data.lng,
                    visitors: data.visitors // Include visitor details for expandable view
                })),

            // Globe markers
            markers,

            // Active pages
            pages: Object.entries(pageMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([path, count]) => ({ path, count })),

            // Daily aggregates
            daily: {
                date: dailyStats.date,
                orders: dailyStats.orders,
                revenue: dailyStats.revenue,
                uniqueVisitors: dailyStats.visitors?.length || 0
            },

            // Device breakdown
            devices: {
                mobile: activeVisitors.filter(v => v.device === 'mobile').length,
                desktop: activeVisitors.filter(v => v.device === 'desktop').length
            },

            // Recent activity feed
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

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/analytics-live.json');

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
    'AE': 'United Arab Emirates', 'US': 'United States', 'GB': 'United Kingdom',
    'IN': 'India', 'SA': 'Saudi Arabia', 'KW': 'Kuwait', 'QA': 'Qatar',
    'BH': 'Bahrain', 'OM': 'Oman', 'EG': 'Egypt', 'PK': 'Pakistan',
    'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain',
    'CA': 'Canada', 'AU': 'Australia', 'JP': 'Japan', 'CN': 'China',
    'BR': 'Brazil', 'RU': 'Russia', 'ZA': 'South Africa', 'NG': 'Nigeria',
    'KE': 'Kenya', 'SG': 'Singapore', 'MY': 'Malaysia', 'TH': 'Thailand',
    'ID': 'Indonesia', 'PH': 'Philippines', 'VN': 'Vietnam', 'BD': 'Bangladesh',
    'LK': 'Sri Lanka', 'NP': 'Nepal', 'JO': 'Jordan', 'LB': 'Lebanon',
    'TR': 'Turkey', 'IR': 'Iran', 'IQ': 'Iraq', 'AF': 'Afghanistan'
};

// Approximate capital coordinates for fallback
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
    'AE': { lat: 25.2048, lng: 55.2708 }, 'US': { lat: 38.9072, lng: -77.0369 },
    'GB': { lat: 51.5074, lng: -0.1278 }, 'IN': { lat: 28.6139, lng: 77.2090 },
    'SA': { lat: 24.7136, lng: 46.6753 }, 'KW': { lat: 29.3759, lng: 47.9774 },
    'QA': { lat: 25.2854, lng: 51.5310 }, 'BH': { lat: 26.2285, lng: 50.5860 },
    'OM': { lat: 23.5880, lng: 58.3829 }, 'EG': { lat: 30.0444, lng: 31.2357 },
    'PK': { lat: 33.6844, lng: 73.0479 }, 'DE': { lat: 52.5200, lng: 13.4050 },
    'FR': { lat: 48.8566, lng: 2.3522 }, 'IT': { lat: 41.9028, lng: 12.4964 },
    'ES': { lat: 40.4168, lng: -3.7038 }, 'CA': { lat: 45.4215, lng: -75.6972 },
    'AU': { lat: -35.2809, lng: 149.1300 }, 'JP': { lat: 35.6762, lng: 139.6503 },
    'CN': { lat: 39.9042, lng: 116.4074 }, 'BR': { lat: -15.7975, lng: -47.8919 },
    'RU': { lat: 55.7558, lng: 37.6173 }, 'ZA': { lat: -25.7479, lng: 28.2293 },
    'NG': { lat: 9.0765, lng: 7.3986 }, 'KE': { lat: -1.2921, lng: 36.8219 },
    'SG': { lat: 1.3521, lng: 103.8198 }, 'MY': { lat: 3.1390, lng: 101.6869 },
    'TH': { lat: 13.7563, lng: 100.5018 }, 'ID': { lat: -6.2088, lng: 106.8456 },
    'Unknown': { lat: 25.2048, lng: 55.2708 } // Default to Dubai
};

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
    ip: string; // Store IP for location details
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
        visitors: Set<string> | string[];
    };
    historicalVisits: HistoricalVisit[]; // For 24h/7d tracking
}


async function readData(): Promise<AnalyticsData> {
    try {
        const content = await fs.readFile(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        // Convert visitors array to Set for dailyStats if needed
        if (parsed.dailyStats?.visitors && Array.isArray(parsed.dailyStats.visitors)) {
            parsed.dailyStats.visitors = new Set(parsed.dailyStats.visitors);
        }
        return {
            visitors: parsed.visitors || {},
            dailyStats: parsed.dailyStats || { date: '', orders: 0, revenue: 0, visitors: new Set() },
            historicalVisits: parsed.historicalVisits || []
        };
    } catch {
        return {
            visitors: {},
            dailyStats: { date: '', orders: 0, revenue: 0, visitors: new Set() },
            historicalVisits: []
        };
    }
}

async function writeData(data: AnalyticsData): Promise<void> {
    // Convert Set to Array for JSON serialization
    const toWrite = {
        visitors: data.visitors,
        dailyStats: {
            ...data.dailyStats,
            visitors: Array.isArray(data.dailyStats.visitors)
                ? data.dailyStats.visitors
                : Array.from(data.dailyStats.visitors)
        },
        historicalVisits: data.historicalVisits || []
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(toWrite, null, 2));
}

// Cleanup historical visits older than 7 days
function cleanupHistoricalVisits(visits: HistoricalVisit[]): HistoricalVisit[] {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return visits.filter(v => v.timestamp > sevenDaysAgo);
}

function cleanupOldVisitors(visitors: Record<string, Visitor>): Record<string, Visitor> {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const cleaned: Record<string, Visitor> = {};
    for (const [id, visitor] of Object.entries(visitors)) {
        if (visitor.lastBeat > fiveMinutesAgo) {
            cleaned[id] = visitor;
        }
    }
    return cleaned;
}

function getTodayDate(): string {
    // Use local timezone for midnight reset
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, path: visitorPath, action = 'view', cartItems = 0, orderId, orderTotal } = body;

        if (!visitorId) {
            return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
        }

        // Get geolocation from Vercel headers first
        let country = req.headers.get('x-vercel-ip-country') || '';
        let city = req.headers.get('x-vercel-ip-city') || '';
        let lat = parseFloat(req.headers.get('x-vercel-ip-latitude') || '0');
        let lng = parseFloat(req.headers.get('x-vercel-ip-longitude') || '0');

        // Fallback: Use free IP geolocation API for local development
        if (!country || country === 'Unknown' || country === '') {
            try {
                // Get client IP from headers
                const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                    || req.headers.get('x-real-ip')
                    || '';

                // Use ip-api.com (free, no API key, 45 requests/min limit)
                const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,city,lat,lon`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.status === 'success') {
                        country = geoData.countryCode || 'AE';
                        city = geoData.city || 'Unknown';
                        lat = geoData.lat || 25.2048;
                        lng = geoData.lon || 55.2708;
                    }
                }
            } catch (e) {
                console.log('[Analytics] IP lookup failed, using default location');
            }
        }

        // Final fallback to Dubai if still no location
        if (!country || country === '') {
            country = 'AE';
            city = 'Dubai';
            lat = 25.2048;
            lng = 55.2708;
        }

        // If we have country but no coords, use capital coordinates
        if (lat === 0 && lng === 0) {
            const coords = COUNTRY_COORDS[country] || COUNTRY_COORDS['AE'];
            lat = coords.lat + (Math.random() - 0.5) * 2;
            lng = coords.lng + (Math.random() - 0.5) * 2;
        }

        const countryName = COUNTRY_NAMES[country] || country;
        const device = req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop';

        // Read existing data
        const data = await readData();

        // Check if daily stats need reset (new day)
        const today = getTodayDate();
        if (data.dailyStats.date !== today) {
            data.dailyStats = { date: today, orders: 0, revenue: 0, visitors: new Set() };
        }

        // Track unique daily visitors
        if (data.dailyStats.visitors instanceof Set) {
            data.dailyStats.visitors.add(visitorId);
        } else {
            data.dailyStats.visitors = new Set([...(data.dailyStats.visitors || []), visitorId]);
        }

        // Handle order completion
        if (action === 'complete' && orderId && orderTotal) {
            data.dailyStats.orders += 1;
            data.dailyStats.revenue += parseFloat(orderTotal) || 0;
        }

        // Get client IP
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';

        // Update visitor record
        const visitor: Visitor = {
            id: visitorId,
            lastBeat: Date.now(),
            country,
            countryName,
            city,
            lat,
            lng,
            path: visitorPath || '/',
            action,
            cartItems: parseInt(cartItems) || 0,
            device: device as 'mobile' | 'desktop',
            ip: clientIp
        };

        // Add to historical visits (for 24h/7d tracking)
        const isNewVisit = !data.visitors[visitorId] ||
            (Date.now() - data.visitors[visitorId].lastBeat) > 30 * 60 * 1000; // New session if >30min gap

        if (isNewVisit) {
            data.historicalVisits.push({
                visitorId,
                timestamp: Date.now(),
                country,
                countryName,
                ip: clientIp
            });
            // Cleanup old historical visits
            data.historicalVisits = cleanupHistoricalVisits(data.historicalVisits);
        }

        data.visitors[visitorId] = visitor;

        // Cleanup old visitors
        data.visitors = cleanupOldVisitors(data.visitors);

        // Write back
        await writeData(data);

        console.log(`[Analytics] Beat: ${visitorId} | ${action} | ${visitorPath} | ${countryName}`);

        return NextResponse.json({
            success: true,
            activeCount: Object.keys(data.visitors).length
        });

    } catch (error) {
        console.error('[Analytics] Beat error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

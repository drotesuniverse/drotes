import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/lib/redis';

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
    'Unknown': { lat: 25.2048, lng: 55.2708 }
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, path: visitorPath, action = 'view', cartItems = 0, orderId, orderTotal } = body;

        if (!visitorId) {
            return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
        }

        // Check Redis availability
        if (!redis) {
            console.warn('[Analytics] Redis not configured, skipping...');
            return NextResponse.json({ success: true, activeCount: 0, warning: 'Redis not configured' });
        }

        // Get geolocation from Vercel headers first
        let country = req.headers.get('x-vercel-ip-country') || '';
        let city = req.headers.get('x-vercel-ip-city') || '';
        let lat = parseFloat(req.headers.get('x-vercel-ip-latitude') || '0');
        let lng = parseFloat(req.headers.get('x-vercel-ip-longitude') || '0');

        // Fallback: Use HTTPS geolocation API
        if (!country || country === 'Unknown' || country === '') {
            try {
                const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                    || req.headers.get('x-real-ip')
                    || '';

                // Use ipapi.co (free HTTPS, no API key, 1000/day)
                const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
                    signal: AbortSignal.timeout(3000)
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.country_code) {
                        country = geoData.country_code || 'AE';
                        city = geoData.city || 'Unknown';
                        lat = geoData.latitude || 25.2048;
                        lng = geoData.longitude || 55.2708;
                    }
                }
            } catch (e) {
                console.log('[Analytics] IP lookup failed, using default location');
            }
        }

        // Final fallback to Dubai
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
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';

        // Build visitor object
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

        // Store visitor in Redis hash (expires in 10 minutes)
        await redis.hset(REDIS_KEYS.VISITORS, { [visitorId]: JSON.stringify(visitor) });
        await redis.expire(REDIS_KEYS.VISITORS, 600); // 10 min TTL

        // Daily stats
        const today = getTodayDate();
        const dailyKey = `${REDIS_KEYS.DAILY_STATS}:${today}`;

        // Track unique visitors
        await redis.sadd(`${dailyKey}:visitors`, visitorId);
        await redis.expire(`${dailyKey}:visitors`, 86400 * 2); // 2 day TTL

        // Handle order completion
        if (action === 'complete' && orderId && orderTotal) {
            await redis.hincrby(dailyKey, 'orders', 1);
            await redis.hincrbyfloat(dailyKey, 'revenue', parseFloat(orderTotal) || 0);
            await redis.expire(dailyKey, 86400 * 2);
        }

        // Historical visits (for 24h/7d tracking)
        const historicalVisit: HistoricalVisit = {
            visitorId,
            timestamp: Date.now(),
            country,
            countryName,
            ip: clientIp
        };
        await redis.lpush(REDIS_KEYS.HISTORICAL, JSON.stringify(historicalVisit));
        await redis.ltrim(REDIS_KEYS.HISTORICAL, 0, 9999); // Keep last 10000 entries
        await redis.expire(REDIS_KEYS.HISTORICAL, 86400 * 8); // 8 day TTL

        // Get active count
        const allVisitors = await redis.hgetall(REDIS_KEYS.VISITORS);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        let activeCount = 0;
        for (const v of Object.values(allVisitors || {})) {
            try {
                const parsed = typeof v === 'string' ? JSON.parse(v) : v;
                if (parsed.lastBeat > fiveMinutesAgo) activeCount++;
            } catch { }
        }

        console.log(`[Analytics] Beat: ${visitorId} | ${action} | ${visitorPath} | ${countryName}`);

        return NextResponse.json({ success: true, activeCount });

    } catch (error) {
        console.error('[Analytics] Beat error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

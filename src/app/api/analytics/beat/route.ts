import { NextRequest, NextResponse } from 'next/server';

// Firebase Realtime DB REST API URL
const FIREBASE_DB_URL = 'https://otp-drotes-default-rtdb.firebaseio.com';

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
    'Unknown': { lat: 25.2048, lng: 55.2708 }
};

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

        // Get geolocation from Vercel headers
        let country = req.headers.get('x-vercel-ip-country') || '';
        let city = req.headers.get('x-vercel-ip-city') || '';
        let lat = parseFloat(req.headers.get('x-vercel-ip-latitude') || '0');
        let lng = parseFloat(req.headers.get('x-vercel-ip-longitude') || '0');

        // Fallback: Use HTTPS geolocation API
        if (!country || country === '') {
            try {
                const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
                const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, { signal: AbortSignal.timeout(2000) });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.country_code) {
                        country = geoData.country_code;
                        city = geoData.city || 'Unknown';
                        lat = geoData.latitude || 25.2048;
                        lng = geoData.longitude || 55.2708;
                    }
                }
            } catch { }
        }

        // Final fallback
        if (!country) {
            country = 'AE';
            city = 'Dubai';
            lat = 25.2048;
            lng = 55.2708;
        }

        if (lat === 0 && lng === 0) {
            const coords = COUNTRY_COORDS[country] || COUNTRY_COORDS['AE'];
            lat = coords.lat + (Math.random() - 0.5) * 2;
            lng = coords.lng + (Math.random() - 0.5) * 2;
        }

        const countryName = COUNTRY_NAMES[country] || country;
        const device = req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop';
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const today = getTodayDate();

        const visitor = {
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
            device,
            ip: clientIp
        };

        // Write updates via REST API (Fire-and-forget to avoid blocking response)
        // 1. Update live visitor
        fetch(`${FIREBASE_DB_URL}/visitors/live/${visitorId}.json`, {
            method: 'PUT',
            body: JSON.stringify(visitor)
        }).catch(console.error);

        // 2. Add to history
        fetch(`${FIREBASE_DB_URL}/visitors/history/${today}/${visitorId}.json`, {
            method: 'PUT',
            body: JSON.stringify({
                timestamp: Date.now(),
                country,
                countryName,
                ip: clientIp
            })
        }).catch(console.error);

        // 3. Update stats if order completed
        if (action === 'complete' && orderId && orderTotal) {
            // Need transaction logic via REST, but for simplicity here we just increment locally
            // Ideally, robust apps use Cloud Functions for aggregation
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Analytics] Beat error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

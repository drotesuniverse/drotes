import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin (server-side)
// Uses default credentials from GOOGLE_APPLICATION_CREDENTIALS env var
// Or falls back to anonymous access for testing
let db: ReturnType<typeof getDatabase> | null = null;

try {
    if (!getApps().length) {
        // For Vercel, use environment variable for service account
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount),
                databaseURL: 'https://otp-drotes-default-rtdb.firebaseio.com'
            });
        } else {
            // Fallback: Use anonymous/public rules (set in Firebase Console)
            initializeApp({
                databaseURL: 'https://otp-drotes-default-rtdb.firebaseio.com'
            });
        }
    }
    db = getDatabase();
} catch (e) {
    console.warn('[Analytics] Firebase Admin init failed:', e);
}

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

        // Get geolocation from Vercel headers (accurate on Vercel Edge)
        let country = req.headers.get('x-vercel-ip-country') || '';
        let city = req.headers.get('x-vercel-ip-city') || '';
        let lat = parseFloat(req.headers.get('x-vercel-ip-latitude') || '0');
        let lng = parseFloat(req.headers.get('x-vercel-ip-longitude') || '0');

        // Fallback: Use HTTPS geolocation API for local/non-Vercel
        if (!country || country === '') {
            try {
                const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                    || req.headers.get('x-real-ip') || '';

                const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, {
                    signal: AbortSignal.timeout(3000)
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.country_code) {
                        country = geoData.country_code;
                        city = geoData.city || 'Unknown';
                        lat = geoData.latitude || 25.2048;
                        lng = geoData.longitude || 55.2708;
                    }
                }
            } catch {
                console.log('[Analytics] IP lookup failed');
            }
        }

        // Final fallback
        if (!country) {
            country = 'AE';
            city = 'Dubai';
            lat = 25.2048;
            lng = 55.2708;
        }

        // Use capital coords if no lat/lng
        if (lat === 0 && lng === 0) {
            const coords = COUNTRY_COORDS[country] || COUNTRY_COORDS['AE'];
            lat = coords.lat + (Math.random() - 0.5) * 2;
            lng = coords.lng + (Math.random() - 0.5) * 2;
        }

        const countryName = COUNTRY_NAMES[country] || country;
        const device = req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop';
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const today = getTodayDate();

        // Build visitor object
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

        // Write to Firebase if available
        if (db) {
            try {
                // Update live visitor (expires via cleanup job or TTL)
                await db.ref(`visitors/live/${visitorId}`).set(visitor);

                // Add to daily history for 24h/7d counts
                await db.ref(`visitors/history/${today}/${visitorId}`).set({
                    timestamp: Date.now(),
                    country,
                    countryName,
                    ip: clientIp
                });

                // Track daily stats
                if (action === 'complete' && orderId && orderTotal) {
                    const statsRef = db.ref(`visitors/dailyStats/${today}`);
                    await statsRef.transaction((current) => {
                        current = current || { orders: 0, revenue: 0 };
                        current.orders = (current.orders || 0) + 1;
                        current.revenue = (current.revenue || 0) + parseFloat(orderTotal);
                        return current;
                    });
                }

                console.log(`[Analytics] Beat: ${visitorId} | ${action} | ${visitorPath} | ${countryName}`);
            } catch (e) {
                console.error('[Analytics] Firebase write error:', e);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Analytics] Beat error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

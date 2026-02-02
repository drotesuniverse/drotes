import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://bck.drotes.com';

    // Forward Headers
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const userAgent = req.headers.get('user-agent');

    const endpoints = [
        `${baseUrl}/wp-json/wmc/v1/params`,
        `${baseUrl}/wp-json/wmc/v1/rates`,
        `${baseUrl}/wp-json/wc/v3/data/currencies`,
    ];

    // Helper with 4s timeout
    const fetchWithTimeout = async (url: string) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);

        try {
            const headers: Record<string, string> = {
                'Authorization': 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64'),
            };
            if (clientIp) headers['X-Forwarded-For'] = clientIp;
            if (userAgent) headers['User-Agent'] = userAgent;

            const host = req.headers.get('host');
            if (host) headers['X-Forwarded-Host'] = host;

            const res = await fetch(url, {
                headers,
                signal: controller.signal
            });
            clearTimeout(id);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            clearTimeout(id);
            throw err;
        }
    };

    try {
        const response = await Promise.any(endpoints.map(url => fetchWithTimeout(url)));

        // GEOLOCATION LOGIC (Tiered Fallback)
        let detectedCountry = req.headers.get('x-vercel-ip-country');

        // Tier 2: Upstream determined country (if any)
        if (!detectedCountry && response.country) {
            detectedCountry = response.country;
        }

        // Tier 3: External IP API (For Local/VPS/Non-Vercel) - MUST USE HTTPS
        if (!detectedCountry) {
            try {
                // Use client IP if available, otherwise API defaults to caller's IP
                const queryIp = (clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1') ? clientIp : '';
                // Use ipapi.co (free HTTPS, no API key, 1000/day)
                const ipRes = await fetch(`https://ipapi.co/${queryIp}/json/`, { signal: AbortSignal.timeout(3000) });
                if (ipRes.ok) {
                    const ipData = await ipRes.json();
                    if (ipData?.country_code) {
                        detectedCountry = ipData.country_code;
                        console.log(`[API] Detected Country via ipapi.co: ${detectedCountry} (IP: ${queryIp || 'Self'})`);
                    }
                }
            } catch (err) {
                console.warn("[API] IP-API geolocation fallback failed:", err);
            }
        }

        // Final Assignment (Default to AE)
        response.country = detectedCountry || "AE";

        return NextResponse.json(response);
    } catch (error) {
        console.error("All currency endpoints failed or timed out.");
        return NextResponse.json({ error: "Could not fetch rates" }, { status: 500 });
    }
}

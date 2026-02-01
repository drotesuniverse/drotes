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

        // INJECT VERCEL COUNTRY HEADER
        const vercelCountry = req.headers.get('x-vercel-ip-country');
        if (vercelCountry) {
            console.log(`[API] Detected Vercel Country: ${vercelCountry}`);
            // Check if backend already provided it. If not (or if we trust Vercel more), override/set it.
            // Let's set it as a distinct field that the frontend looks for.
            response.country = vercelCountry;
        } else {
            // Development fallback or direct access
            response.country = "AE";
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("All currency endpoints failed or timed out.");
        return NextResponse.json({ error: "Could not fetch rates" }, { status: 500 });
    }
}

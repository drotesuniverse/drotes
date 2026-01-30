import { NextResponse } from 'next/server';

export async function GET() {
    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://bck.drotes.com';

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
            const res = await fetch(url, {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64')
                },
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
        return NextResponse.json(response);

    } catch (error) {
        console.error("All currency endpoints failed or timed out.");
        return NextResponse.json({ error: "Could not fetch rates" }, { status: 500 });
    }
}

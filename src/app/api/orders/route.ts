import { NextResponse } from 'next/server';

export async function GET() {
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    const url = "https://bck.drotes.com/wp-json/wc/v3/orders"; // Hardcoded base per .env.local domain

    if (!consumerKey || !consumerSecret) {
        return NextResponse.json({ error: 'Missing WooCommerce credentials' }, { status: 500 });
    }

    try {
        const credentials = btoa(`${consumerKey}:${consumerSecret}`);
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("WooCommerce API Error:", errorText);
            return NextResponse.json({ error: `WooCommerce Error: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

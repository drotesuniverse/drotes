import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    let body;
    try {
        const text = await req.text();
        if (!text) {
            return NextResponse.json({ error: "Empty request body" }, { status: 400 });
        }
        body = JSON.parse(text);
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://bck.drotes.com/graphql";

    // Check if this is a mutation (cart-modifying operation)
    const queryText = body.query || "";
    const isMutation = queryText.toLowerCase().includes('mutation');
    const isCartMutation = queryText.toLowerCase().includes('addtocart') ||
        queryText.toLowerCase().includes('updatecart') ||
        queryText.toLowerCase().includes('removecart');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Forward Client Headers for correct location/currency detection
    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    if (forwarded) headers['X-Forwarded-For'] = forwarded;

    const userAgent = req.headers.get('user-agent');
    if (userAgent) headers['User-Agent'] = userAgent;

    // ========== Session Handling ==========
    const clientSession = req.headers.get('x-wc-session');

    if (clientSession) {
        headers['woocommerce-session'] = `Session ${clientSession}`;
        if (isCartMutation) {
            console.log(`[Proxy] Cart Mutation - Sending session: ${clientSession.substring(0, 30)}...`);
        }
    }

    const cookie = req.headers.get('cookie');
    if (cookie) {
        headers['Cookie'] = cookie;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data);

        // ========== Capture Session Header ==========
        const wpSession = response.headers.get('woocommerce-session');

        if (wpSession) {
            const token = wpSession.replace(/^Session\s+/i, '').trim();
            console.log(`\n★★★ WooCommerce SESSION CAPTURED! ★★★`);
            console.log(`Token: ${token.substring(0, 50)}...`);
            console.log(`From: ${isCartMutation ? 'Cart Mutation' : 'Query'}\n`);
            nextResponse.headers.set('X-WC-Session', token);
        } else if (isCartMutation) {
            console.log(`\n⚠ WARNING: Cart mutation did NOT return woocommerce-session header!`);
            console.log(`This is unusual - check WPGraphQL WooCommerce plugin configuration.\n`);
        }

        // Forward cookies (for other WP features)
        const setCookieHeaderValues: string[] = [];
        if ('getSetCookie' in response.headers && typeof (response.headers as any).getSetCookie === 'function') {
            const cookies = (response.headers as any).getSetCookie();
            cookies.forEach((c: string) => setCookieHeaderValues.push(c));
        } else {
            const c = response.headers.get('set-cookie');
            if (c) setCookieHeaderValues.push(c);
        }

        setCookieHeaderValues.forEach((cookie: string) => {
            const parts = (cookie || "").split(';');
            const cleanParts: string[] = [];
            if (parts.length > 0) cleanParts.push(parts[0].trim());
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i].trim();
                const lower = part.toLowerCase();
                if (lower.startsWith('domain=')) continue;
                if (lower === 'secure') continue;
                if (lower.startsWith('samesite=')) continue;
                if (lower.startsWith('path=')) continue;
                if (lower.startsWith('expires=')) continue;
                if (lower.startsWith('max-age=')) continue;
                if (lower.startsWith('httponly')) continue;
                cleanParts.push(part);
            }
            cleanParts.push('Path=/');
            cleanParts.push('SameSite=Lax');
            let newCookie = cleanParts.join('; ').replace(/[\n\r]/g, '');
            nextResponse.headers.append('Set-Cookie', newCookie);
        });

        return nextResponse;
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: "Failed to fetch from GraphQL backend" }, { status: 500 });
    }
}

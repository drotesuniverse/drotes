import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";

const customFetch = async (uri: RequestInfo | URL, options?: RequestInit) => {
    // 1. Prepare Request Headers (Manual Session Injection)
    const headers = new Headers(options?.headers || {});

    // Only run in browser
    if (typeof window !== "undefined") {
        const storedSession = localStorage.getItem('wc_session_id');
        if (storedSession) {
            headers.append('X-WC-Session', storedSession);
            // console.log("[Apollo] Injecting stored session header");
        }
    }

    const newOptions = {
        ...options,
        headers: headers
    };

    // 2. Execute Request (Enforce no-store to prevent stale App Router caching)
    const response = await fetch(uri, {
        ...newOptions,
        cache: 'no-store'
    });

    // 3. Process Response (Capture Session)
    const newSession = response.headers.get('x-wc-session');
    if (newSession && typeof window !== "undefined") {
        localStorage.setItem('wc_session_id', newSession);
        console.log("[Apollo] Captured & Saved Session ID:", newSession.substring(0, 15) + "...");
    }

    // Debug Headers
    const hasSession = response.headers.get('x-debug-has-session');
    const names = response.headers.get('x-debug-incoming-cookie-names');
    const wpCount = response.headers.get('x-debug-wp-set-cookie-count');

    if (newSession) {
        console.log(`[Apollo] Debug: Session Captured via Header! (Fallback Active)`);
    } else {
        console.log(`[Apollo] Debug: Session Present? ${hasSession} | Names: ${names} | WP Set Cookies: ${wpCount}`);
    }

    return response;
};

const httpLink = new HttpLink({
    uri: "/api/graphql",
    fetch: customFetch,
    fetchOptions: { credentials: 'include' } // Explicitly include cookies
});

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
        // Type policies can be added here if needed for cart normalization
        typePolicies: {
            Cart: {
                keyFields: [], // Cart is a singleton usually? or implicit
                merge: true,
            }
        }
    }),
});

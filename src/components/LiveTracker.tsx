"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_CART } from '@/lib/queries';

export default function LiveTracker() {
    const pathname = usePathname();
    const visitorIdRef = useRef<string>("");
    const lastActionRef = useRef<string>("view");

    // Get real cart count from Apollo Cache
    const { data: cartData } = useQuery(GET_CART, {
        fetchPolicy: "cache-first",
    });

    const cartCount = cartData?.cart?.contents?.nodes?.length || 0;

    // Memoized beat sender
    const sendBeat = useCallback((action: string, extra: Record<string, unknown> = {}) => {
        if (typeof window === 'undefined' || document.visibilityState === 'hidden') return;

        fetch('/api/analytics/beat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorId: visitorIdRef.current,
                path: window.location.pathname,
                action,
                cartItems: cartCount,
                ...extra
            }),
            keepalive: true,
        }).catch(err => console.error("Analytics beat failed", err));
    }, [cartCount]);

    useEffect(() => {
        // Generate or retrieve visitor ID
        let vid = localStorage.getItem('drotes_vid');
        if (!vid) {
            vid = `v_${Math.random().toString(36).substring(2, 12)}`;
            localStorage.setItem('drotes_vid', vid);
        }
        visitorIdRef.current = vid;

        // Determine action based on cart state
        let action: string = 'view';
        if (cartCount > 0) {
            action = 'cart';
        }

        // Check if on checkout page
        if (pathname.includes('/checkout')) {
            action = 'checkout';
        }

        lastActionRef.current = action;

        // Send initial beat
        sendBeat(action);

        // Heartbeat every 5 seconds
        const interval = setInterval(() => {
            sendBeat(lastActionRef.current);
        }, 5000);

        return () => clearInterval(interval);
    }, [pathname, cartCount, sendBeat]);

    // Listen for cart updates to immediately report
    useEffect(() => {
        const handleCartUpdate = () => {
            lastActionRef.current = 'cart';
            sendBeat('cart');
        };

        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, [sendBeat]);

    // Expose global function for success page to call
    useEffect(() => {
        (window as any).__trackOrderComplete = (orderId: string, orderTotal: number) => {
            sendBeat('complete', { orderId, orderTotal });
        };
    }, [sendBeat]);

    return null;
}

"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root options={{
            lerp: 0.07, // Lower lerp = smoother/slower catchup
            duration: 1.2,
            smoothWheel: true,
            wheelMultiplier: 0.9 // Slightly reduce scroll speed for "weighty" feel
        }}>
            {children}
        </ReactLenis>
    );
}

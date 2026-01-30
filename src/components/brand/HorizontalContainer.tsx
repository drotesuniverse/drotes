"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HorizontalContainer({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Horizontal Scroll Logic
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                // Determine if we should scroll horizontally
                // If container has overflow-x
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="flex flex-nowrap w-full h-screen overflow-x-auto overflow-y-hidden bg-neutral-200 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            {children}
            <style jsx global>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

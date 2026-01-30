"use client";

import Link from "next/link";
import { useState } from "react";

export default function BrutalHeader() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-black w-full max-w-7xl mx-auto flex justify-between items-stretch h-16">
            {/* Logo Segment */}
            <div className="border-r border-black px-4 flex items-center justify-center min-w-[120px]">
                <Link href="/" className="font-[family-name:var(--font-heading)] font-bold text-2xl tracking-tighter">ANEC:DOTE</Link>
            </div>

            {/* Marquee/Ticker Segment */}
            <div className="hidden md:flex flex-1 items-center overflow-hidden border-r border-black bg-neon/10">
                <div className="whitespace-nowrap animate-marquee text-xs font-bold uppercase tracking-widest px-4">
                    SYSTEM ONLINE. COLLECTION 01 DEPLOYED. SHIPPING GLOBAL. SYSTEM ONLINE. COLLECTION 01 DEPLOYED.
                </div>
            </div>

            {/* Nav Segment */}
            <nav className="flex">
                <Link href="/shop" className="border-l border-black px-6 flex items-center hover:bg-black hover:text-neon transition-colors text-sm font-bold uppercase">
                    Index
                </Link>
                <Link href="/cart" className="border-l border-black px-6 flex items-center hover:bg-black hover:text-neon transition-colors text-sm font-bold uppercase">
                    Cart (0)
                </Link>
            </nav>
        </header>
    );
}

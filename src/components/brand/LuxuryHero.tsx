"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function LuxuryHero() {
    return (
        <section className="h-screen w-full relative overflow-hidden bg-obsidian">
            {/* Main Visual */}
            <div className="absolute inset-0">
                <Image
                    src="/assets/origin.jpg"
                    alt="Campaign Origin"
                    fill
                    className="object-cover object-center opacity-80"
                    priority
                />
                {/* Cinematic Overlay - subtle gradient from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Content Anchor */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 flex flex-col items-center md:items-start">

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full text-center"
                >
                    {/* Massive Typography */}
                    <h1 className="font-[family-name:var(--font-bodoni)] font-bold text-[18vw] leading-[0.8] text-white tracking-tighter mix-blend-difference select-none">
                        ANEC<span className="text-white/50">:</span>DOTE
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="w-full flex justify-between items-end mt-4 px-2"
                >
                    <span className="text-white/60 text-xs tracking-[0.3em] uppercase hidden md:block">
                        Est. 2026 — Global
                    </span>
                    <span className="text-white/60 text-xs tracking-[0.3em] uppercase">
                        Collection 01
                    </span>
                </motion.div>
            </div>
        </section>
    );
}

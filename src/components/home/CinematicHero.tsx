"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export default function CinematicHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { settings, isLoaded } = useAdminSettings();
    const { scrollY } = useScroll();

    const y = useTransform(scrollY, [0, 1000], [0, 400]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);
    const textY = useTransform(scrollY, [0, 500], [0, 100]);

    if (!isLoaded) return <div className="h-screen w-full bg-[#050505]" />;

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050505]">
            {/* Background Layer */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 z-0"
            >
                {settings.heroImage ? (
                    <Image
                        src={settings.heroImage}
                        alt="Hero"
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-900 animate-pulse-slow opacity-20"></div>
                )}

                {/* Texture/Noise Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 via-transparent to-[#050505]"></div>
            </motion.div>

            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
                <motion.div
                    style={{ opacity, y: textY }}
                    className="flex flex-col items-center text-center space-y-10"
                >
                    {/* Brand Tagline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-6"
                    >
                        <div className="h-[1px] w-8 md:w-16 bg-white/20"></div>
                        <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.4em] text-white/50">
                            The Untold Narrative
                        </span>
                        <div className="h-[1px] w-8 md:w-16 bg-white/20"></div>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="text-7xl md:text-[9rem] font-black tracking-tighter text-white leading-[0.85] mix-blend-difference"
                    >
                        ANEC:DOTE
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="max-w-md text-sm md:text-base text-neutral-400 font-light leading-relaxed tracking-wide"
                    >
                        We do not sell clothes. We archive moments. <br className="hidden md:block" />
                        Every thread a memory. Every vessel a story.
                    </motion.p>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-12 flex flex-col items-center gap-3"
                >
                    <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Explore Collection</span>
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowDown className="text-white/40" strokeWidth={1} size={20} />
                    </motion.div>
                </motion.div>
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050505_120%)] opacity-80"></div>
        </div>
    );
}

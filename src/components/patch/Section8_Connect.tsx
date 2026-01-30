"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Section8_Connect() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Parallax for text layers
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0.4]);

    return (
        <section ref={containerRef} className="min-h-screen relative flex items-center justify-center overflow-hidden bg-drotes-black py-40">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-drotes-black/50 to-drotes-black pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <motion.div style={{ opacity }} className="relative">
                    {/* Cinematic Large Type */}
                    <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-12 relative">
                        <motion.h2
                            style={{ y: y1 }}
                            className="text-[12vw] leading-[0.8] font-bold tracking-tighter text-white mix-blend-difference"
                        >
                            ANEC
                        </motion.h2>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="h-[2px] w-32 bg-white/50 hidden md:block"
                        />

                        <motion.h2
                            style={{ y: y2 }}
                            className="text-[12vw] leading-[0.8] font-light tracking-tighter text-drotes-muted/50 mix-blend-difference"
                        >
                            DOTE
                        </motion.h2>
                    </div>

                    {/* Sub-content with Glassmorphic Detail */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20 md:mt-32 items-end">
                        <div className="space-y-6">
                            <span className="block text-xs font-bold tracking-[0.3em] text-drotes-accent uppercase pl-1 border-l-2 border-drotes-accent">
                                The Philosophy
                            </span>
                            <p className="text-2xl md:text-4xl font-light text-drotes-text leading-tight max-w-lg">
                                Every hoodie carries a story. <br />
                                <span className="text-drotes-muted">Not printed. Not explained. Only lived.</span>
                            </p>
                        </div>

                        <div className="glass p-8 md:p-12 rounded-tl-[3rem] border-l border-t border-white/10 relative">
                            <div className="absolute top-4 right-4 text-white/20">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
                            </div>
                            <p className="text-lg text-drotes-muted font-light leading-relaxed mb-8">
                                The Drotes Patch is how those stories stay with you.
                                Some move forward quietly. Some stay right where you need them.
                            </p>
                            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
                        // Collection 2026
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

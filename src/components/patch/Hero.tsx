"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scaleGlow = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

    return (
        <section ref={containerRef} className="relative h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden perspective-1000">
            {/* Background Ambient Glow - Parallax */}
            <motion.div
                style={{ scale: scaleGlow }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-drotes-gray/10 rounded-full blur-[120px] pointer-events-none"
            />

            {/* Floating Particles/Elements could go here for more "Wow" */}

            <motion.div
                style={{ y: yText, opacity: opacityText }}
                className="z-10 max-w-5xl relative"
            >
                <motion.span
                    initial={{ opacity: 0, letterSpacing: "0.5em" }}
                    animate={{ opacity: 1, letterSpacing: "0.2em" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="inline-block mb-8 text-xs sm:text-sm text-drotes-muted/80 uppercase font-medium"
                >
                    The Drotes Patch
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="text-5xl sm:text-7xl md:text-9xl font-light tracking-tight text-drotes-text mb-8"
                >
                    Not Just a Patch. <br />
                    <span className="text-gradient font-normal">A Personal Signal.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="max-w-2xl mx-auto text-lg sm:text-xl text-drotes-muted font-light leading-relaxed"
                >
                    A discreet, wrist-mounted detail embedded into every hoodie.
                    <br className="hidden sm:block" /> Carrying meaning, memories, and motivation.
                </motion.p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-12 flex flex-col items-center gap-2 text-drotes-muted/60"
            >
                <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                    <ChevronDown size={20} />
                </motion.div>
            </motion.div>
        </section>
    );
}

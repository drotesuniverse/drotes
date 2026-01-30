"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Fingerprint } from "lucide-react";

export default function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_1%)] bg-[size:24px_24px] opacity-[0.03]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Active Particles */}
            {/* Active Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white/30 rounded-full blur-[1px] pointer-events-none"
                    style={{
                        width: Math.random() * 3 + 1,
                        height: Math.random() * 3 + 1,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -150, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0]
                    }}
                    transition={{
                        duration: 4 + Math.random() * 6,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                    }}
                />
            ))}

            <div className="container px-6 relative z-10 text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ y: y1 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
                    >
                        <Fingerprint size={14} className="text-white/70 animate-pulse" />
                        <span className="text-xs tracking-[0.2em] font-black text-white/70 uppercase">
                            Unique Identity
                        </span>
                    </motion.div>

                    <h1 className="text-center">
                        <span className="block text-6xl md:text-9xl font-black tracking-tighter text-white text-glow mb-2">
                            ANECDOTE
                        </span>
                        <span className="block text-4xl md:text-7xl font-bold text-white/80 tracking-normal uppercase">
                            Collection
                        </span>
                    </h1>

                    <p className="mt-8 text-xl md:text-2xl font-bold text-white/80 max-w-xl mx-auto leading-relaxed tracking-wide">
                        For the Stories We Never Tell.
                    </p>
                </motion.div>

                {/* Static Identity Visual */}
                <motion.div
                    style={{ y: y2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className="mt-16 relative"
                >
                    <div className="w-px h-20 bg-gradient-to-b from-white/0 via-white/50 to-white/0 mx-auto" />
                    <div className="w-4 h-4 rounded-full border border-white/50 bg-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_white]" />
                </motion.div>
            </div>

            <motion.div
                style={{ opacity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
            >
                <LinkDown />
            </motion.div>
        </section>
    );
}

function LinkDown() {
    return (
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ArrowDown size={16} />
        </motion.div>
    );
}

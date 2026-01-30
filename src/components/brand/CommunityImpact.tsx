"use client";

import { motion } from "framer-motion";
import { HeartCrack, HandHeart } from "lucide-react";

export default function CommunityImpact() {
    return (
        <section id="charity" className="relative min-h-[80vh] bg-obsidian text-ash py-32 overflow-hidden flex flex-col justify-center">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3f0d0d_0%,_#050505_60%)] opacity-20" />

            {/* The Lifeline Animation (Background) */}
            <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 opacity-20 pointer-events-none" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <motion.path
                    d="M0,50 L200,50 L220,10 L240,90 L260,50 L400,50 L420,0 L440,100 L460,50 L600,50 L620,20 L640,80 L660,50 L1000,50"
                    fill="none"
                    stroke="#c7a04f" // Gold/Life color
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                />
            </svg>

            <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
                {/* Header */}
                <div className="text-center mb-24 space-y-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-block p-3 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    </motion.div>
                    <h2 className="font-serif text-4xl md:text-7xl text-white tracking-tight leading-tight">
                        "Never Bend. Never Break. <br />
                        <span className="text-stone/50">We Rise When They Thought We’d Fall."</span>
                    </h2>
                </div>

                {/* The 2 Stages Grid - Focussed Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative max-w-5xl mx-auto">

                    {/* Stage 1: The Downfall */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative p-10 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm group transition-all duration-500 hover:bg-white/10 hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                    >
                        {/* Icon Wrapper Pulse */}
                        <div className="w-20 h-20 bg-obsidian border border-stone/20 rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:border-red-500/50 transition-colors duration-500">
                            <div className="absolute inset-0 rounded-full bg-red-500/20 opacity-0 group-hover:animate-ping" />
                            <HeartCrack className="w-8 h-8 text-stone group-hover:text-red-400 transition-colors duration-500" />
                        </div>
                        <h3 className="font-serif text-3xl text-white mb-6">The Battle</h3>
                        <p className="text-stone/70 text-lg leading-relaxed">
                            We give back because our story isn't just about personal growth. It's about lifting others too. We ensure no one fights their battles alone.
                        </p>
                    </motion.div>

                    {/* Stage 2: The Pledge */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="relative p-10 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm group transition-all duration-500 hover:bg-white/10 hover:border-gold/30 hover:shadow-[0_0_30px_rgba(199,160,79,0.1)]"
                    >
                        {/* Icon Wrapper Pulse */}
                        <div className="w-20 h-20 bg-obsidian border border-stone/20 rounded-full flex items-center justify-center mb-8 relative z-10 group-hover:border-gold/50 transition-colors duration-500">
                            <div className="absolute inset-0 rounded-full bg-gold/20 opacity-0 group-hover:animate-ping" />
                            <HandHeart className="w-8 h-8 text-stone group-hover:text-gold transition-colors duration-500" />
                        </div>
                        <h3 className="font-serif text-3xl text-white mb-6">The 1% Pledge</h3>
                        <p className="text-stone/70 text-lg leading-relaxed">
                            <span className="text-white font-bold">1% of Drotes' annual sales</span> support charities and causes that matter. We fund the lifelines.
                        </p>
                    </motion.div>

                </div>

                {/* Final Call / Outro */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-32 text-center max-w-3xl mx-auto"
                >
                    <p className="text-xl md:text-2xl text-white font-serif italic mb-8">
                        "To all my homies out there — we are men, and we don’t break. We rise. <br />
                        This is your fight. This is Drotes."
                    </p>
                    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-4" />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-stone/40">Drotes © 2026</p>
                </motion.div>
            </div>
        </section>
    );
}

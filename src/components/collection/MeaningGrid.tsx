"use client";

import { motion } from "framer-motion";
import { Mic2, MessageSquareText, CloudFog, HeartHandshake, Quote, Sparkles } from "lucide-react";

export default function MeaningGrid() {
    return (
        <section className="py-40 px-6 relative z-10">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#220505_0%,_transparent_70%)] opacity-30 pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Title Block (Span 4) */}
                <div className="lg:col-span-4 flex flex-col justify-center space-y-6 lg:pr-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 text-[#8a1c1c]"
                    >
                        <Sparkles size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">The Core Meaning</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[0.9]"
                    >
                        What Anecdote <br /> <span className="text-white/20">Means to Us.</span>
                    </motion.h2>

                    <p className="text-lg text-white/50 leading-relaxed font-light">
                        We don't just sell clothes. We provide a vessel for your most important memories.
                    </p>
                </div>

                {/* Grid Content (Span 8) - Modern Masonry/Bento */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">

                    <BentoCard
                        icon={Mic2}
                        title="Your Voice"
                        desc="Store the messages you can't text."
                        delay={0.2}
                        className="md:col-span-2 bg-[#0a0a0a] border-white/10"
                    />

                    <BentoCard
                        icon={MessageSquareText}
                        title="Unspoken Truths"
                        desc="Say what you couldn't say then."
                        delay={0.3}
                        className="bg-neutral-900/50 border-white/5"
                    />

                    <BentoCard
                        icon={HeartHandshake}
                        title="A Promise"
                        desc="To keep their memory close."
                        delay={0.4}
                        className="bg-neutral-900/50 border-white/5"
                    />

                </div>

            </div>
        </section>
    );
}

function BentoCard({ icon: Icon, title, desc, delay, className }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.6 }}
            className={`relative p-8 rounded-[2rem] border flex flex-col justify-between h-64 overflow-hidden group hover:border-white/20 transition-colors ${className}`}
        >
            <div className="absolute top-0 right-0 p-32 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform">
                <Icon size={24} strokeWidth={1.5} />
            </div>

            <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-bold text-white group-hover:text-red-200 transition-colors">{title}</h3>
                <p className="text-white/40 font-light">{desc}</p>
            </div>
        </motion.div>
    );
}

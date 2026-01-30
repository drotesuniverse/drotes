"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Fingerprint, Layers, Sparkles } from "lucide-react";

export default function VesselSection() {
    return (
        <section className="relative min-h-screen w-full bg-black flex flex-col md:flex-row">

            {/* Left: Image (Back text) */}
            <div className="w-full md:w-1/2 h-[60vh] md:h-screen relative overflow-hidden group">
                <Image
                    src="/images/back.jpg"
                    alt="Anecdote Back"
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/80 md:bg-black/20" />

                {/* Overlay Badge */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                    <Sparkles size={14} className="text-white" />
                    <span className="text-[10px] font-mono text-white tracking-widest uppercase">Premium Cotton</span>
                </div>
            </div>

            {/* Right: Content */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-24 bg-black relative z-10">
                <div className="space-y-12 max-w-lg w-full">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-white/40 mb-4 flex items-center gap-2">
                            <Layers size={12} /> The Vessel
                        </h2>
                        <h3 className="text-5xl md:text-7xl font-medium text-white leading-none mb-6 tracking-tight">
                            More Than <br /> <span className="font-serif italic text-white/50">Clothing.</span>
                        </h3>
                        <div className="w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </motion.div>

                    <div className="space-y-6">
                        <InfoCard
                            icon={Fingerprint}
                            title="Personal Identity"
                            text="Created to hold meaning. Not just for the world to see, but specifically for the one who needs it."
                        />
                        <InfoCard
                            icon={Sparkles}
                            title="Anti-Trend"
                            text="This collection was not created to follow trends. It exists outside of time."
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-4"
                    >
                        <button className="group flex items-center gap-4 text-white hover:opacity-80 transition-opacity">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                <ArrowRight size={20} />
                            </div>
                            <span className="text-sm font-mono uppercase tracking-widest">Discover the Design</span>
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function InfoCard({ icon: Icon, title, text }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex gap-5"
        >
            <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10">
                <Icon size={18} className="text-white/70" />
            </div>
            <div>
                <h4 className="text-white font-medium mb-1">{title}</h4>
                <p className="text-white/50 font-light text-sm leading-relaxed">{text}</p>
            </div>
        </motion.div>
    );
}

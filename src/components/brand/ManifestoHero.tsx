"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ManifestoHero() {
    return (
        <section className="h-[95vh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-obsidian border-b border-stone/5">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-black/20 z-10" />

            {/* Background Image - Clean & Vibrant */}
            <div className="absolute inset-0">
                <Image
                    src="/assets/origin.jpg"
                    alt="Collection Campaign"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            <div className="relative z-20 text-center px-6 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <h1 className="font-[family-name:var(--font-bodoni)] font-bold text-6xl md:text-9xl text-white tracking-widest leading-none mb-6">
                        anec<span className="text-white/50">:</span>dote
                    </h1>
                    <p className="font-sans text-white/80 uppercase tracking-[0.4em] text-xs md:text-sm mb-12">
                        Collection 01 — Available Now
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <a
                        href="https://www.drotes.com/shop"
                        className="px-12 py-4 bg-white text-black hover:bg-neutral-200 transition-colors uppercase tracking-widest text-xs font-bold"
                    >
                        Shop Collection
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function Section1_WhatIs() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
    const yAnim = useTransform(scrollYProgress, [0, 1], [50, -50]);

    return (
        <section ref={containerRef} className="py-20 md:py-32 px-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-drotes-gray/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left: Copy */}
                <motion.div
                    style={{ y: yAnim }}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 order-2 lg:order-1"
                >
                    <span className="block text-xs font-medium tracking-[0.2em] text-drotes-muted mb-8 uppercase">
                        The Hardware
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-light text-drotes-text mb-8 md:mb-12">
                        What Is the <br /> <span className="font-normal text-white">Drotes Patch?</span>
                    </h2>

                    <div className="glass p-8 rounded-3xl space-y-6 text-lg text-drotes-muted font-light leading-relaxed border border-white/5 backdrop-blur-xl">
                        <p>
                            The Drotes Patch is a subtle detail placed on the wrist of every hoodie.
                            Inside it lives technology — but more importantly, intention.
                        </p>
                        <div className="w-full h-[1px] bg-white/5" />
                        <p>
                            It’s designed to be unnoticed by others, yet always accessible to you.
                            A quiet reminder. A private message. A memory that stays.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="mt-12 md:mt-16 flex flex-col gap-2 md:gap-4 text-drotes-text font-normal text-xl sm:text-2xl tracking-tight"
                    >
                        <span className="opacity-50">No screens.</span>
                        <span className="opacity-70">No noise.</span>
                        <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Just a tap.</span>
                    </motion.div>
                </motion.div>

                {/* Right: Real Product Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative lg:h-[800px] h-[500px] w-full rounded-[2.5rem] overflow-hidden order-1 lg:order-2 border border-white/5 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <Image
                        src="/drotes-real.jpg"
                        alt="Detailed view of the Drotes Patch on a hoodie"
                        fill
                        className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-[1.5s]"
                        priority
                    />

                    {/* Floating Detail Tag */}
                    <div className="absolute bottom-8 left-8 z-20 glass px-6 py-3 rounded-full flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold tracking-widest text-white uppercase">Live Product Detail</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

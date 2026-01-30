"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, ShoppingBag, Layers, Aperture } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BentoGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const yMid = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const ySlow = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const yFast = useTransform(scrollYProgress, [0, 1], [0, -300]);

    return (
        <section ref={containerRef} className="py-24 px-4 md:px-8 max-w-[1920px] mx-auto bg-[#050505] overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8"
            >
                <div className="space-y-4">
                    <span className="text-white/20 font-mono text-[10px] uppercase tracking-[0.6em]">Department / 001</span>
                    <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter text-white uppercase leading-[0.8]">
                        CORE<br /><span className="text-neutral-800">SYSTEM</span>
                    </h2>
                </div>
                <p className="max-w-xs text-neutral-500 text-xs uppercase tracking-widest leading-loose text-right">
                    Performance meets permanence. <br />
                    Curated selections for the <br />
                    modern archive.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[1400px]">

                {/* Spotlight 1: New Season (Large) */}
                <div className="md:col-span-8 md:row-span-6 group relative overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl">
                    <motion.div
                        style={{ y: yMid, willChange: "transform" }}
                        className="absolute inset-0 z-0"
                    >
                        <Image
                            src="https://res.cloudinary.com/dzb0jezs8/image/upload/v1769506099/drotes/admin/admin_1769506097976_drotes.jpg"
                            alt="New Season"
                            fill
                            priority
                            className="object-cover opacity-70 transition-transform duration-[2.5s] ease-[0.16,1,0.3,1] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    </motion.div>

                    <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 text-white">
                                <Aperture size={24} strokeWidth={1} />
                            </div>
                            <span className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-mono mt-2">v2.06 / 2026</span>
                        </div>

                        <div>
                            <h3 className="text-5xl md:text-[5.5rem] font-black text-white uppercase tracking-tighter leading-none mb-8">
                                New<br />Season
                            </h3>
                            <Link href="/shop" className="inline-flex items-center gap-6 group/btn">
                                <div className="h-14 px-10 bg-white text-black flex items-center justify-center font-black uppercase tracking-[0.2em] text-[10px] rounded-full group-hover/btn:bg-neutral-200 transition-colors">
                                    Shop Collection
                                </div>
                                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white group-hover/btn:border-white transition-colors">
                                    <ArrowRight size={20} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Spotlight 2: Signature (Vertical) */}
                <div className="md:col-span-4 md:row-span-9 group relative overflow-hidden rounded-3xl bg-[#080808]">
                    <motion.div
                        style={{ y: yFast, willChange: "transform" }}
                        className="absolute inset-x-0 -top-40 -bottom-40 z-0"
                    >
                        <Image
                            src="/bento_armor_bg.png"
                            alt="Signature Collection"
                            fill
                            className="object-cover opacity-50 grayscale transition-all duration-[3s] ease-[0.16,1,0.3,1] group-hover:grayscale-0 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-700" />
                    </motion.div>

                    <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                        <ShoppingBag className="text-white/20" size={32} strokeWidth={1} />

                        <div>
                            <span className="text-white/40 text-[9px] uppercase tracking-[0.5em] block mb-4">Limited Release</span>
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                                Signature<br />Series
                            </h3>
                            <p className="text-neutral-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8 max-w-[200px]">
                                The definitive artifacts of the Drotes identity.
                            </p>
                            <Link href="/shop" className="text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-4 group/link">
                                <span>Explore</span>
                                <div className="h-px w-8 bg-white/30 group-hover/link:w-16 transition-all duration-500" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Spotlight 3: Accessories (Horizontal Small) */}
                <div className="md:col-span-8 md:row-span-3 group relative overflow-hidden rounded-3xl bg-[#0a0a0a]">
                    <motion.div
                        style={{ y: ySlow, willChange: "transform" }}
                        className="absolute inset-0 z-0 text-white/5 font-black text-[20rem] flex items-center justify-center pointer-events-none opacity-20"
                    >
                        ACC
                    </motion.div>
                    <Image
                        src="/bento_identity_bg.png"
                        alt="Accessories"
                        fill
                        className="object-cover opacity-20 mix-blend-overlay transition-transform duration-[1s] group-hover:scale-110"
                    />

                    <div className="relative z-10 p-12 h-full flex items-center justify-between">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Essential Objects</h3>
                            <p className="text-neutral-500 text-[10px] uppercase tracking-[0.4em]">Hardware / Vessels / Tethers</p>
                        </div>
                        <Link href="/shop" className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-500 group">
                            <Layers size={24} strokeWidth={1} className="transition-transform group-hover:rotate-90" />
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, ArrowUpRight } from "lucide-react";

export default function CharityModern() {
    return (
        <section className="relative w-full py-32 bg-zinc-950 text-white overflow-hidden">
            {/* Ambient Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black opacity-60" />

            <div className="relative container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/* Left: Typography & Story */}
                <div className="space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs"
                    >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>Community First</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter"
                    >
                        We Heal. <br /> <span className="text-zinc-600">We Rise.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-zinc-400 leading-relaxed max-w-lg"
                    >
                        Fashion is our medium, but people are our purpose. We dedicated 1% of every sale to organizations fighting for suicide prevention and healing the heartbreak that silence brings.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <button className="group flex items-center gap-4 text-white border-b border-white/20 pb-2 hover:border-white transition-all">
                            <span className="uppercase tracking-widest text-sm font-bold">Our Impact</span>
                            <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                {/* Right: Visual Imagery */}
                <div className="relative">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-[4/5] w-full overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
                    >
                        <Image
                            src="/assets/image3.jpg" // Using an existing emotional/human image
                            alt="Community"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                        <div className="absolute bottom-8 left-8 right-8">
                            <blockquote className="text-lg font-medium italic text-white/90">
                                "From the darkness of isolation comes the strength of unity."
                            </blockquote>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}

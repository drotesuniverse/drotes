"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function Section7_Philosophy() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Parallax effects
    const yImage = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={containerRef} className="py-40 px-6 relative overflow-hidden">
            {/* Background typographic element */}
            <h2 className="absolute top-1/4 left-1/2 -translate-x-1/2 text-[15vw] font-bold text-white/[0.02] tracking-tighter leading-none pointer-events-none whitespace-nowrap">
                PHILOSOPHY
            </h2>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 relative z-10">

                {/* Left: Interactive/Visual Column */}
                <div className="flex-1 flex flex-col justify-between min-h-[500px]">
                    <motion.div style={{ y: yImage }}>
                        <div className="relative w-full h-80 rounded-3xl overflow-hidden mb-8 border border-white/10 group">
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 z-10" />
                            <img
                                src="/drotes-real.jpg"
                                alt="Drotes Design Philosophy"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1s] scale-110 group-hover:scale-100"
                            />
                            <div className="absolute bottom-4 left-4 z-20">
                                <span className="text-[10px] font-bold tracking-[0.3em] text-white uppercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    Figure 01. The Signal
                                </span>
                            </div>
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-light text-drotes-text leading-tight mb-8">
                            Why We <br />
                            <span className="text-drotes-muted italic">Built This</span>
                        </h2>
                        <div className="glass p-8 rounded-3xl backdrop-blur-3xl border-l-[3px] border-l-white/20">
                            <p className="text-lg text-drotes-muted font-light leading-relaxed">
                                "We live in an age of constant noise. We wanted to build a signal. Something that doesn't demand attention, but rewards connection."
                            </p>
                            <div className="mt-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase text-white/50">Drotes Design Lab</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-12 lg:mt-0">
                        <a
                            href="https://www.drotes.com/shop"
                            className="group inline-flex items-center gap-4 text-white uppercase tracking-widest text-sm font-bold border-b border-white/20 pb-2 hover:border-white transition-all"
                        >
                            Explore the collection
                            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </a>
                    </div>
                </div>

                {/* Right: The Core Beliefs (Manifesto List) */}
                <div className="flex-1 space-y-8 lg:pt-32">
                    {[
                        { title: "Digital Silence", desc: "Technology should feel invisible until you need it." },
                        { title: "Tactile Memory", desc: "Objects carry more meaning than notifications." },
                        { title: "Permanent Signal", desc: "A message on a screen fades. A message on a patch stays." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="group border-t border-white/10 pt-8 hover:border-white/30 transition-colors"
                        >
                            <div className="flex items-baseline justify-between mb-4">
                                <h3 className="text-2xl font-normal text-drotes-text group-hover:text-white transition-colors">{item.title}</h3>
                                <span className="text-xs font-mono text-drotes-muted/50">0{i + 1}</span>
                            </div>
                            <p className="text-drotes-muted font-light text-lg max-w-sm group-hover:text-drotes-muted/80 transition-colors">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

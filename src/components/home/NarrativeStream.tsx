"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const NARRATIVE_CHAPTERS = [
    {
        title: "The Silence",
        text: "In a world of noise, we choose silence. Not the absence of sound, but the presence of meaning. We strip away the unnecessary to reveal the essential.",
        // Using a dark placeholder or noise texture if real image is missing
        placeholderColor: "bg-[#101010]"
    },
    {
        title: "The Vessel",
        text: "Clothing is more than fabric; it is a vessel for memory. It absorbs the places you go, the people you meet, the stories you live.",
        placeholderColor: "bg-[#151515]"
    },
    {
        title: "The Artifact",
        text: "We do not design for the season. We design for the archive. Objects meant to age, to fray, to become part of you.",
        placeholderColor: "bg-[#0a0a0a]"
    }
];

export default function NarrativeStream() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} className="relative bg-[#050505] text-neutral-200">
            {NARRATIVE_CHAPTERS.map((chapter, index) => (
                <Chapter key={index} chapter={chapter} index={index} />
            ))}
        </section>
    );
}

function Chapter({ chapter, index }: { chapter: any, index: number }) {
    return (
        <div className="min-h-screen flex items-center justify-center relative border-b border-white/5 py-24 px-6">
            <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/* Text Side */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: false, margin: "-20%" }}
                    className={`space-y-10 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                >
                    <div className="flex items-center gap-4 text-white/30 text-xs font-mono tracking-widest uppercase">
                        <span>0{index + 1}</span>
                        <div className="h-[1px] w-12 bg-current"></div>
                        <span>Protocol</span>
                    </div>

                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                        {chapter.title}
                    </h2>

                    <p className="text-lg md:text-xl text-neutral-400 font-light leading-relaxed max-w-md">
                        {chapter.text}
                    </p>
                </motion.div>

                {/* Image Side */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: false, margin: "-20%" }}
                    className={`relative aspect-[4/5] overflow-hidden ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                >
                    <div className={`absolute inset-0 ${chapter.placeholderColor} border border-white/5`}>
                        {/* Placeholder Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/10 font-black text-9xl tracking-tighter mix-blend-overlay rotate-90">
                                {index + 1}
                            </span>
                        </div>
                    </div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-40"></div>
                </motion.div>
            </div>
        </div>
    );
}

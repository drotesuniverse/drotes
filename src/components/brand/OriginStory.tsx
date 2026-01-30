"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function OriginStory() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({ target: container, offset: ["start end", "end start"] });

    const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={container} className="min-h-[150vh] w-full bg-obsidian text-ash py-32 relative flex flex-col items-center justify-center overflow-hidden">

            <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                {/* Text Content */}
                <div className="space-y-12">
                    <motion.div style={{ opacity }} className="space-y-6">
                        <span className="block text-xs uppercase tracking-[0.3em] text-stone">The Origin</span>
                        <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-ash leading-none">
                            Forged <br /> in Fire.
                        </h2>
                    </motion.div>

                    <div className="space-y-8 border-l border-stone/20 pl-8">
                        <p className="text-stone/80 text-lg leading-relaxed font-light">
                            Every great brand has a story. But not all stories are easy to tell. Drotes wasn’t born from success; it was forged in the heat of personal battles — moments of darkness, loneliness, and overwhelming doubt that felt like a permanent weight on the chest.
                        </p>
                        <p className="text-stone/80 text-lg leading-relaxed font-light">
                            It starts in the aftermath of shattered dreams. It wasn’t just a broken heart; it was the reflection of someone pushed aside, told they weren’t enough. "You’re useless. You’ll never make it," the words echoed.
                        </p>
                        <p className="text-stone/80 text-lg leading-relaxed font-light">
                            The person who was once the last hope — even the diamond disappeared. Left alone, stuck between life and death, the eldest son of aging parents, feeling like a failure. Give up, or keep pushing? The uncertainty weighed heavy.
                        </p>
                    </div>
                </div>

                {/* Visual Content - Parallax Image */}
                <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-white/5 shadow-2xl shadow-black">
                    <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%] will-change-transform">
                        <Image
                            src="/assets/origin.jpg"
                            alt="The Journey"
                            fill
                            className="object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

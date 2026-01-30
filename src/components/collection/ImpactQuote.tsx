"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { Quote } from "lucide-react";

export default function ImpactQuote() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    const words1 = "Sometimes, a message at the".split(" ");
    const words2 = "right moment".split(" ");
    const words3 = "can change everything.".split(" ");

    return (
        <section ref={containerRef} className="relative h-[120vh] w-full flex items-center justify-center overflow-hidden bg-black">

            {/* Background: Street/Ambience */}
            <motion.div style={{ scale }} className="absolute inset-0 opacity-30">
                <Image
                    src="/images/street.jpg"
                    alt="Street Ambience"
                    fill
                    className="object-cover grayscale"
                />
                <div className="absolute inset-0 bg-black/70" />
            </motion.div>

            <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-6 text-center">

                <div className="mb-12 flex justify-center">
                    <Quote size={40} className="text-white/20 fill-white/5" />
                </div>

                <div className="space-y-4 md:space-y-8">
                    {/* Line 1 */}
                    <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-6">
                        {words1.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ y: 50, opacity: 0, filter: "blur(10px)" }}
                                whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                transition={{ delay: i * 0.05, duration: 0.8 }}
                                className="text-3xl md:text-7xl font-bold text-white tracking-tight"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </div>

                    {/* Line 2 (Highlighted) */}
                    <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-6">
                        {words2.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ scale: 0.5, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                                className="text-4xl md:text-8xl font-serif italic text-[#722F37] leading-tight"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </div>

                    {/* Line 3 */}
                    <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-6">
                        {words3.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ y: 50, opacity: 0, filter: "blur(10px)" }}
                                whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                transition={{ delay: 0.8 + i * 0.05, duration: 0.8 }}
                                className="text-3xl md:text-7xl font-bold text-white tracking-tight"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </div>
                </div>

                <div className="my-16 w-px h-32 bg-gradient-to-b from-white/0 via-white/20 to-white/0 mx-auto" />

                <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="text-2xl md:text-4xl font-light text-white/60"
                >
                    Sometimes, being <span className="text-white font-medium border-b border-[#722F37]">remembered</span> is enough.
                </motion.h3>
            </motion.div>
        </section>
    );
}

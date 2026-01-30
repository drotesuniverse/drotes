"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Shield, EyeOff, Lock } from "lucide-react";

export default function Section6_Privacy() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Reveal text effect
    const opacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
    const blur = useTransform(scrollYProgress, [0.2, 0.5], ["10px", "0px"]);

    return (
        <section ref={containerRef} className="py-40 px-6 relative overflow-hidden">
            {/* Ambient Red Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-900/20 border border-red-500/20 text-red-200 text-xs font-bold uppercase tracking-widest"
                >
                    <Lock size={12} />
                    Private by Design
                </motion.div>

                <motion.h2
                    style={{ opacity, filter: `blur(${blur})` }}
                    className="text-4xl md:text-6xl font-light text-drotes-text leading-tight mb-16"
                >
                    What’s inside the patch is <span className="text-white font-normal">yours</span>. <br />
                    And <span className="text-red-500 font-normal">only yours</span>.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="text-xl md:text-2xl text-drotes-muted font-light max-w-2xl mx-auto"
                >
                    Because some stories aren’t meant to be told out loud.
                </motion.p>
            </div>

            {/* Grid of subtle privacy icons */}
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 opacity-40">
                {[
                    { icon: Shield, label: "Encrypted" },
                    { icon: EyeOff, label: "No Tracking" },
                    { icon: Lock, label: "Local Key" },
                    { icon: Shield, label: "Secure" }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                        <item.icon size={24} className="text-drotes-muted" />
                        <span className="text-xs font-mono text-drotes-muted uppercase tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

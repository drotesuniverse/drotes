"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Smartphone, Lock, Play } from "lucide-react";
import { useRef } from "react";

const steps = [
    {
        icon: Smartphone,
        title: "Tap",
        description: "Hold your phone near the Drotes Patch.",
    },
    {
        icon: Lock,
        title: "Unlock",
        description: "Your private page opens instantly.",
    },
    {
        icon: Play,
        title: "Experience",
        description: "See the message left for you.",
    },
];

export default function Section2_HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={containerRef} className="py-32 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24 relative z-10"
                >
                    <span className="block text-xs font-medium tracking-[0.2em] text-red-500/50 mb-4 uppercase">
                        Integration
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-light text-drotes-text">The Connection</h2>
                </motion.div>

                {/* Timeline Container */}
                <div className="relative flex flex-col items-center gap-24">

                    {/* The Pulse Line (Absolute Center background) */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white/5 -translate-x-1/2 h-full rounded-full overflow-hidden">
                        <motion.div
                            style={{ height: lineHeight }}
                            className="w-full bg-gradient-to-b from-red-900 via-red-500 to-red-900 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                        />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            className="relative z-10 flex flex-col items-center text-center bg-black/40 backdrop-blur-md border border-white/5 p-8 rounded-full w-64 aspect-square justify-center shadow-2xl group hover:border-red-500/30 transition-colors duration-500"
                        >
                            <div className="mb-4 text-white/80 group-hover:text-red-500 transition-colors duration-300">
                                <step.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-normal text-drotes-text mb-2">{step.title}</h3>
                            <p className="text-sm text-drotes-muted font-light leading-relaxed max-w-[150px]">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { MicOff, VolumeX, Radio, Activity } from "lucide-react";
import { useRef } from "react";

export default function ContextSection() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

    return (
        <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center py-20">

            {/* Background Image: Noise (Microphones) */}
            <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
                <Image
                    src="/images/noise.png"
                    alt="World of Noise"
                    fill
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </motion.div>

            {/* Floating Icons Animation */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {[MicOff, VolumeX, Radio, Activity].map((Icon, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-white/5"
                        initial={{
                            x: Math.random() * 100 - 50 + "%",
                            y: "110%",
                            rotate: Math.random() * 360
                        }}
                        animate={{
                            y: "-100%",
                            rotate: Math.random() * 360 + 360
                        }}
                        transition={{
                            duration: 15 + Math.random() * 10,
                            repeat: Infinity,
                            delay: i * 2,
                            ease: "linear"
                        }}
                        style={{ left: `${20 + i * 20}%` }}
                    >
                        <Icon size={120 + Math.random() * 100} />
                    </motion.div>
                ))}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 text-center space-y-12 max-w-5xl px-6">

                {/* Animated Mute Icon */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 1.5 }}
                    className="w-24 h-24 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center backdrop-blur-md relative"
                >
                    <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-20" />
                    <MicOff size={40} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                </motion.div>

                <div className="space-y-4">
                    <motion.h2
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]"
                    >
                        World Full <br /> of <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10">Noise</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
                    <FeatureItem
                        icon={Activity}
                        title="Unheard Struggles"
                        desc="Pressures that don't show on the surface. Mental exhaustion."
                        delay={0.2}
                    />
                    <FeatureItem
                        icon={VolumeX}
                        title="Silent Battles"
                        desc="Some struggles are never posted. Some emotions are never shared."
                        delay={0.4}
                    />
                    <FeatureItem
                        icon={Radio}
                        title="Lost Signals"
                        desc="The quiet moments where giving up feels easier than continuing."
                        delay={0.6}
                    />
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ icon: Icon, title, desc, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
        >
            <Icon size={24} className="text-white/60 mb-4 group-hover:text-white transition-colors" />
            <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
            <p className="text-sm text-white/40 leading-relaxed font-light">{desc}</p>
        </motion.div>
    );
}

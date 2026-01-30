"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Lock, Zap, Smartphone, Cpu } from "lucide-react";

export default function HiddenLayer() {
    return (
        <section className="py-32 px-6 bg-[#0a0a0a] relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-24">

                {/* Title Block */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tighter"
                    >
                        Why We Built It <br /> <span className="text-white/20">This Way.</span>
                    </motion.h2>
                    <p className="text-xl text-white/50 font-light">
                        Fashion is usually about what you show. This is about what you keep.
                    </p>
                </div>

                {/* Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Visual Side (4 Cols) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-5 relative h-[600px] w-full rounded-[2rem] overflow-hidden"
                    >
                        <Image
                            src="/images/hanging.jpg"
                            alt="Hanging Hoodie"
                            fill
                            className="object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    </motion.div>

                    {/* Features Side (8 Cols) - Clean Stack */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Feature
                            icon={Lock}
                            title="Ideally Hidden"
                            desc="Invisible technology. Keyed directly into the fabric. No ugly codes."
                        />
                        <Feature
                            icon={Zap}
                            title="Instant Reaction"
                            desc="Embedded Field reacts only to your touch. Zero latency connection."
                        />
                        <Feature
                            icon={Smartphone}
                            title="Digital Memory"
                            desc="Store voice notes, songs, or letters. Update them as you grow."
                        />
                        <Feature
                            icon={Cpu}
                            title="Passive Power"
                            desc="No batteries needed. Powered by the field of your device."
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}

function Feature({ icon: Icon, title, desc }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
            <Icon size={32} className="text-white mb-6" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-white/50 leading-relaxed text-sm">{desc}</p>
        </motion.div>
    );
}

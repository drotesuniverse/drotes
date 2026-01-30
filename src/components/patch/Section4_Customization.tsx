"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MessageSquare, Mic, Video, Heart, ArrowRight } from "lucide-react";
import { useRef } from "react";

const features = [
    { icon: MessageSquare, label: "Text Messages", Sub: "Affirmations, reminders" },
    { icon: Mic, label: "Audio Messages", Sub: "A loved one’s voice" },
    { icon: Video, label: "Video Memories", Sub: "Moments meant to stay" },
];

const occasions = [
    "Birthdays", "Anniversaries", "Long-distance love", "Personal milestones"
];

export default function Section4_Customization() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const xLeft = useTransform(scrollYProgress, [0, 1], [-50, 0]);

    return (
        <section ref={containerRef} className="py-32 px-6 relative">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">

                <motion.div
                    style={{ x: xLeft }}
                    className="flex-1"
                >
                    <span className="block text-xs font-medium tracking-[0.2em] text-drotes-muted mb-8 uppercase">
                        Customization
                    </span>
                    <h2 className="text-5xl sm:text-6xl font-light text-drotes-text mb-8">
                        Make It <br /> <span className="text-gradient">Personal</span>
                    </h2>
                    <p className="text-xl text-drotes-muted font-light mb-12 max-w-md">
                        The Drotes Patch can be customized at the time of purchase.
                        Turn a hoodie into something unforgettable.
                    </p>

                    <div className="space-y-4">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors group cursor-default"
                            >
                                <div className="w-14 h-14 icon-3d-container group-hover:bg-white/10 transition-colors">
                                    <f.icon size={22} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg text-drotes-text">{f.label}</h4>
                                    <p className="text-sm text-drotes-muted group-hover:text-drotes-text/70 transition-colors">{f.Sub}</p>
                                </div>
                                <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-drotes-muted" size={16} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full glass p-8 sm:p-14 rounded-[3rem] relative overflow-hidden"
                >
                    {/* Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-drotes-text/5 rounded-full blur-[80px] -mr-20 -mt-20" />

                    <h3 className="text-2xl font-light text-drotes-text mb-10">Perfect For</h3>
                    <ul className="space-y-6 mb-16">
                        {occasions.map((o, i) => (
                            <li key={i} className="flex items-center gap-4 text-drotes-muted text-lg font-light">
                                <Heart size={18} className="text-drotes-text" fill="white" />
                                <span className="text-drotes-text/80">{o}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="pt-10 border-t border-white/10">
                        <p className="text-3xl sm:text-4xl font-light text-drotes-text leading-tight">
                            Some gifts are worn. <br />
                            <span className="text-drotes-muted italic">Some are felt.</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

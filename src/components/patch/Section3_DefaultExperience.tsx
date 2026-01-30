"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

const messages = [
    { text: "The work speaks for itself.", author: "Focus" },
    { text: "Silence is also an answer.", author: "Clarity" },
    { text: "You are exactly where you need to be.", author: "Presence" },
    { text: "Build in silence.", author: "Growth" }
];

export default function Section3_DefaultExperience() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-32 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/* Left: Copy */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="order-2 lg:order-1"
                >
                    <span className="block text-xs font-medium tracking-[0.2em] text-drotes-muted mb-8 uppercase">
                        Default Mode
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-light text-drotes-text mb-8 md:mb-12">
                        By Default: <br />
                        <span className="text-white font-normal block mt-2">A Reminder When You Need It</span>
                    </h2>

                    <div className="space-y-6 text-lg sm:text-xl text-drotes-muted font-light leading-relaxed max-w-xl">
                        <p>
                            Every Drotes hoodie comes with a default experience.
                            When tapped, the patch opens a private space where the wearer receives rotating motivational messages.
                        </p>
                        <p>
                            It’s a digital fortune cookie. A moment of clarity in a chaotic day.
                        </p>
                    </div>

                    <div className="mt-12 flex items-center gap-4">
                        <div className="w-12 h-[1px] bg-red-500/50" />
                        <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Always Active</span>
                    </div>
                </motion.div>

                {/* Right: Rotating Card Visual */}
                <div className="order-1 lg:order-2 flex justify-center perspective-1000">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full max-w-md aspect-[4/5] glass-card rounded-[2rem] p-8 md:p-12 flex flex-col justify-between"
                    >
                        {/* Header of Card */}
                        <div className="flex justify-between items-start">
                            <Quote className="text-white/20" size={40} />
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                        </div>

                        {/* Rotating Text Area */}
                        <div className="relative h-40">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 flex flex-col justify-center"
                                >
                                    <p className="text-2xl md:text-3xl text-white font-light italic leading-tight mb-4">
                                        "{messages[index].text}"
                                    </p>
                                    <span className="text-xs font-bold text-drotes-muted uppercase tracking-[0.2em]">
                                        / {messages[index].author}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer of Card */}
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-8">
                            <motion.div
                                key={index}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4, ease: "linear" }}
                                className="h-full bg-white/20"
                            />
                        </div>
                    </motion.div>

                    {/* Background Glow for Card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-[80px] pointer-events-none -z-10 rounded-full" />
                </div>

            </div>
        </section>
    );
}

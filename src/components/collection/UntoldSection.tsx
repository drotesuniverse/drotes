"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Moon, Shield, SquarePen } from "lucide-react";

const lines = [
    { text: "Not every story is spoken.", icon: SquarePen },
    { text: "Not every struggle is visible.", icon: Moon },
    { text: "Not every pain is noticed.", icon: Shield },
    { text: " ", icon: null },
    { text: "There are victories nobody applauded.", icon: null },
    { text: "There are nights nobody witnessed.", icon: null },
    { text: "There are thoughts people never share—", icon: null },
    { text: "especially men, who are taught to stay silent,", icon: null },
    { text: "strong, and composed while carrying everything alone.", icon: null },
    { text: " ", icon: null },
    { text: "These are the untold anecdotes.", icon: null }
];

export default function UntoldSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <section ref={ref} className="py-40 px-6 bg-background relative z-10">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

            <div className="max-w-4xl mx-auto space-y-6">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
                        animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        className={`flex items-center gap-6 ${line.text.trim() === "" ? "h-8" : ""}`}
                    >
                        {line.icon && (
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5">
                                <line.icon size={14} className="text-white/50" />
                            </div>
                        )}
                        <span className={`text-2xl md:text-4xl font-light tracking-tight ${line.text.trim() === "" ? "" : "text-white/90"}`}>
                            {line.text}
                        </span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";

const quotes = [
    { text: "The most powerful stories are the ones we carry silently.", author: "Drotes Identity" },
    { text: "Not all signals need to be broadcast.", author: "Hidden Layer" },
    { text: "A memory, stitched into the fabric of now.", author: "Collection 01" },
    { text: "Silence is not empty. It’s full of answers.", author: "Sonic ID" }
];

export default function Closing() {
    const [currentQuote, setCurrentQuote] = useState(0);

    // Quote Rotator Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 6000); // Change every 6 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-6 relative bg-background border-t border-white/5">

            {/* Dynamic Quote Card */}
            <div className="w-full max-w-3xl relative">
                <div className="absolute -top-10 -left-10 text-white/5">
                    <Quote size={120} strokeWidth={1} />
                </div>

                <div className="relative z-10 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuote}
                            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <h3 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">
                                "{quotes[currentQuote].text}"
                            </h3>
                            <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em]">
                                — {quotes[currentQuote].author}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Minimal Loader Bar */}
                <div className="w-48 mx-auto h-[2px] bg-white/10 mt-16 relative overflow-hidden rounded-full">
                    <motion.div
                        key={currentQuote}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="absolute inset-y-0 left-0 bg-white/50"
                    />
                </div>
            </div>

            {/* Final Footer Links */}
            <div className="absolute bottom-10 w-full flex justify-center gap-8 text-[10px] text-white/20 uppercase tracking-widest font-mono">
                <span>© 2026 Drotes</span>
                <span className="cursor-pointer hover:text-white transition-colors">Instagram</span>
                <span className="cursor-pointer hover:text-white transition-colors">Contact</span>
            </div>
        </section>
    );
}

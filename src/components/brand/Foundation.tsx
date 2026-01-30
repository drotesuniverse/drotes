"use client";

import { motion } from "framer-motion";
import { Sun } from "lucide-react";
import { useState } from "react";

export default function Foundation() {
    const [isLit, setIsLit] = useState(false);

    return (
        <section className="relative py-40 bg-black overflow-hidden flex flex-col items-center justify-center text-center px-6 min-h-[80vh]">

            {/* Sunrise Gradient (Default) */}
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-orange-900/20 to-transparent pointer-events-none transition-opacity duration-1000" style={{ opacity: isLit ? 0.2 : 1 }} />

            {/* THE SPOTLIGHT (Torchlight Effect) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -500 }}
                animate={isLit ? { opacity: 1, scale: 20, y: 0 } : { opacity: 0, scale: 0.5, y: -500 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[radial-gradient(circle,_rgba(255,160,50,0.3)_0%,_transparent_70%)] pointer-events-none blur-xl z-0"
            />
            {/* Secondary ambient fill when lit */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={isLit ? { opacity: 0.3 } : { opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-orange-900/30 z-0 pointer-events-none"
            />

            <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                {/* Interactive Icon Trigger */}
                <motion.button
                    onClick={() => setIsLit(!isLit)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 1 }}
                    className={`w-24 h-24 mx-auto border rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.2)] cursor-pointer transition-all duration-500 ${isLit ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_100px_rgba(249,115,22,0.8)]' : 'bg-orange-900/10 border-orange-500/20 text-orange-400'}`}
                >
                    <Sun className={`w-10 h-10 transition-transform duration-1000 ${isLit ? 'rotate-180 scale-125' : ''}`} />
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="space-y-6"
                >
                    <p className={`text-sm uppercase tracking-[0.3em] transition-colors duration-1000 ${isLit ? 'text-orange-200' : 'text-stone/50'}`}>
                        {isLit ? "Vision Illuminated" : "Click to Reveal"}
                    </p>
                    <h2 className="font-serif text-5xl md:text-8xl text-white leading-none">
                        The Drotes <br /> Foundation.
                    </h2>
                    <div className="h-[1px] w-24 bg-orange-500/50 mx-auto" />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-lg md:text-2xl text-stone/80 font-light leading-relaxed max-w-2xl mx-auto"
                >
                    Our ultimate vision. A future dedicated to mental reconstruction. <br />
                    <span className={`transition-all duration-1000 ${isLit ? 'text-orange-100 drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]' : 'text-orange-200'}`}>
                        Helping broken spirits find purpose, strength, and a reason to rise again.
                    </span>
                </motion.p>
            </div>
        </section>
    );
}

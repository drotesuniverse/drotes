"use client";

import { motion } from "framer-motion";

export default function StatementPiece() {
    return (
        <section className="min-h-[60vh] flex items-center justify-center bg-obsidian px-6 py-24">
            <div className="max-w-5xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="font-[family-name:var(--font-bodoni)] text-4xl md:text-7xl leading-tight text-white mb-12"
                >
                    "Silence is the new <span className="italic text-stone-400">luxury</span>.
                    In a world of noise, we choose to <span className="italic text-stone-400">whisper</span>."
                </motion.h2>

                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    className="w-24 h-[1px] bg-white/20 mx-auto"
                />
            </div>
        </section>
    );
}

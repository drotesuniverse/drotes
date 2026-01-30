"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-32 px-6 bg-drotes-black border-t border-drotes-gray/20 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto"
            >
                <h2 className="text-4xl sm:text-6xl font-light text-drotes-text mb-16">
                    Create Your Own Anec:dote
                </h2>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center font-medium">
                    <button className="group px-8 py-4 bg-drotes-text text-drotes-black rounded-full hover:bg-white transition-colors duration-300 flex items-center gap-2">
                        Customize Your Hoodie
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="px-8 py-4 text-drotes-text border border-drotes-gray rounded-full hover:bg-drotes-gray/20 transition-colors duration-300">
                        Explore the Collection
                    </button>
                </div>

                <p className="mt-32 text-xs sm:text-sm text-drotes-muted/50 tracking-widest uppercase">
                    Drotes — Crafted for what you carry, not what you show.
                </p>
            </motion.div>
        </footer>
    );
}

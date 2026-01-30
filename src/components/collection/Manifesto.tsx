"use client";

import { motion } from "framer-motion";

export default function Manifesto() {
    return (
        <section className="py-32 px-6 bg-white text-black relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-24 relative z-10">

                {/* Why We Built It */}
                <div className="space-y-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-light tracking-tight"
                    >
                        Why We Built It This Way
                    </motion.h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6 text-lg font-light leading-relaxed opacity-80">
                            <p>Stories don’t need to be loud.</p>
                            <p>
                                They should be <span className="font-medium">Hidden</span>, until the right moment.
                                <span className="font-medium"> Intentional</span>, not accidental.
                                <span className="font-medium"> Private</span>, not performative.
                            </p>
                        </div>
                        <div className="space-y-6 text-lg font-light leading-relaxed opacity-80">
                            <p>
                                That’s why the Anecdote Collection stores its stories inside the garment itself—waiting to be unlocked when the wearer chooses.
                            </p>
                            <p className="text-xl font-medium">No apps. No noise. Just meaning, on demand.</p>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-black/10" />

                {/* Who This Is For */}
                <div className="space-y-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-light tracking-tight"
                    >
                        Who This Collection Is For
                    </motion.h2>
                    <div className="flex flex-col gap-4">
                        {[
                            "Those who carry more than they show",
                            "Those who never ask for help",
                            "Those fighting battles nobody sees",
                            "Those who survived days they didn’t think they would"
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className="text-xl md:text-2xl font-light border-l-2 border-black/10 pl-6 py-2 hover:border-black/50 transition-colors"
                            >
                                {item}
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        </section>
    );
}

"use client";

import { motion } from "framer-motion";

export default function Section5_Gifting() {
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-drotes-gray/5 skew-y-3 transform origin-top-left -z-10" />

            <div className="max-w-5xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-4xl sm:text-5xl font-light text-drotes-text mb-16"
                >
                    More Than a Gift
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {["A message meant only for them", "A voice they recognize", "A moment they can return to"].map((text, i) => (
                        <motion.div
                            key={i}
                            transition={{ delay: i * 0.1 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="glass p-8 rounded-2xl flex items-center justify-center min-h-[160px]"
                        >
                            <p className="text-xl font-light text-drotes-text">{text}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-24"
                >
                    <p className="text-3xl sm:text-5xl font-light text-drotes-text tracking-tight">
                        This is not fast fashion.
                    </p>
                    <p className="text-3xl sm:text-5xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-white to-drotes-muted mt-4">
                        This is emotional permanence.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

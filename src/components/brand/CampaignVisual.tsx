"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function CampaignVisual() {
    return (
        <section className="h-[80vh] w-full relative overflow-hidden bg-neutral-900 flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/assets/grind.jpg"
                    alt="Campaign Visual"
                    fill
                    className="object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 text-center px-6">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="block text-white/60 tracking-[0.3em] text-sm uppercase mb-6"
                >
                    The Campaign
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-[family-name:var(--font-bodoni)] text-5xl md:text-8xl text-white mb-12"
                >
                    Silent Resilience
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Link
                        href="/lookbook"
                        className="inline-block border border-white px-8 py-3 text-white uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors duration-300"
                    >
                        View Lookbook
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

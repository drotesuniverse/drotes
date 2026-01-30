"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Resilience() {
    return (
        <section className="bg-charcoal py-32 px-6 border-t border-stone/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                {/* Text Content - Right on Desktop (Alternating flow) for balance if Origin is Left-Text */}
                {/* Actually Origin is Text-Left, Image-Right. Let's do Image-Left, Text-Right here. */}

                {/* Visual Content - The Grind Image */}
                <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-white/5 border border-white/5 order-2 md:order-1">
                    <Image
                        src="/assets/grind.jpg"
                        alt="The Grind"
                        fill
                        className="object-cover grayscale contrast-125 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-60" />
                </div>

                {/* Text Content */}
                <div className="text-left space-y-12 order-1 md:order-2">
                    <div className="space-y-6">
                        <span className="text-xs uppercase tracking-[0.3em] text-stone">The Grind</span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="font-serif text-4xl md:text-6xl text-ash leading-tight"
                        >
                            Rising From <br /> <span className="text-stone/50 italic">The Ashes.</span>
                        </motion.h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8 text-stone/80 text-lg md:text-xl font-light leading-relaxed"
                    >
                        <p>
                            Drotes wasn’t born from heartbreak alone. It was born from the darkest moments, where everything seemed lost. It was about rising, again and again.
                        </p>
                        <p>
                            The grind at the gym became the second home. Each rep, each drop of sweat, building something greater. It wasn’t just about getting bigger. It was about becoming stronger — not just physically, but mentally.
                        </p>
                        <div className="w-12 h-[1px] bg-stone/30 my-8" />
                        <p className="italic text-ash">
                            "Drotes is for the warriors who grind in silence. Who keep pushing even when the world tells them they’re done."
                        </p>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}

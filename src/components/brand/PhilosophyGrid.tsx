"use client";

import { motion } from "framer-motion";

const Item = ({ title, text, delay }: { title: string, text: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="space-y-6 border-t border-stone/20 pt-8 group cursor-default"
    >
        <div className="w-12 h-1 bg-gradient-to-r from-stone/40 to-transparent group-hover:w-24 transition-all duration-500" />
        <h3 className="font-serif text-3xl text-ash group-hover:text-white transition-colors">{title}</h3>
        <p className="text-stone text-sm leading-relaxed max-w-xs">{text}</p>
    </motion.div>
);

export default function PhilosophyGrid() {
    return (
        <section className="bg-charcoal/30 py-32 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-24">
                    <span className="text-xs uppercase tracking-[0.3em] text-stone">The Philosophy</span>
                    <h2 className="font-serif text-4xl md:text-7xl mt-4 text-ash max-w-4xl">
                        Heavy Fabrics. <br className="md:hidden" />
                        <span className="text-stone/50">Heavy Hearts.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                    <Item
                        title="Weight"
                        text="Our fabrics are intentionally heavy. They ground you. A physical reminder of your presence in a chaotic world."
                        delay={0}
                    />
                    <Item
                        title="Silence"
                        text="Minimal branding. No shouting. We believe true confidence doesn't need to announce itself."
                        delay={0.2}
                    />
                    <Item
                        title="Connection"
                        text="The hidden link isn't a gimmick. It's a digital lifeline. Daily words of strength sent directly to your wrist."
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
}

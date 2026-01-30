"use client";

import { motion } from "framer-motion";
import { Gift, Calendar, Heart, ShieldQuestion, Star } from "lucide-react";

export default function GiftingSection() {
    return (
        <section className="py-32 px-6 bg-black border-t border-white/5 relative overflow-hidden">

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#1a1a1a_0%,_transparent_40%)] opacity-40" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-24 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400"
                    >
                        <Star size={12} className="fill-purple-500/50" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Perfect For</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tighter"
                    >
                        Who is this <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Collection For?</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UseCaseCard
                        icon={Calendar}
                        title="Milestones"
                        subtitle="Birthdays & Anniversaries"
                        desc="Mark a moment in time with a message that lasts forever."
                        delay={0.1}
                    />
                    <UseCaseCard
                        icon={Gift}
                        title="Gifting"
                        subtitle="Meaningful Gestures"
                        desc="For when a card isn't enough. Give them a piece of your story."
                        delay={0.2}
                    />
                    <UseCaseCard
                        icon={Heart}
                        title="Reminders"
                        subtitle="For Yourself"
                        desc="Store a motivation, a memory, or a reason to keep going."
                        delay={0.3}
                    />
                    <UseCaseCard
                        icon={ShieldQuestion}
                        title="Unspoken"
                        subtitle="Hidden Truths"
                        desc="For the stories you never said out loud, but need to keep safe."
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
}

function UseCaseCard({ icon: Icon, title, subtitle, desc, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="group relative p-10 rounded-[2.5rem] bg-neutral-900 border border-white/5 hover:border-white/20 transition-all hover:bg-neutral-900/80 overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-24 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <Icon size={28} strokeWidth={1.5} />
                </div>

                <div className="mt-auto space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">{title}</h4>
                    <h3 className="text-3xl font-bold text-white">{subtitle}</h3>
                    <p className="text-white/60 font-light leading-relaxed pt-2">{desc}</p>
                </div>
            </div>
        </motion.div>
    );
}

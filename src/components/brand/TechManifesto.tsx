"use client";

import { motion } from "framer-motion";
import { Smartphone, Zap, Fingerprint } from "lucide-react";

export default function TechManifesto() {
    return (
        <section className="py-32 px-6 bg-charcoal text-ash relative overflow-hidden">
            <div className="absolute inset-0 bg-obsidian opacity-50" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-24 text-center">
                    <span className="block text-xs uppercase tracking-[0.3em] text-stone mb-6">The Secret</span>
                    <h2 className="font-serif text-4xl md:text-7xl text-ash mb-8">
                        The Bridge.
                    </h2>
                    <p className="max-w-2xl mx-auto text-stone/70 text-lg leading-relaxed">
                        Strength isn't just built in the body — it lives in the mind. Some days, the weight feels heavier than any barbell. That’s why we weave a reminder. In the wrist of every hoodie lies a secret.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="p-10 border border-stone/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm group hover:border-stone/30 transition-all duration-500">
                        <Smartphone className="w-8 h-8 text-stone mb-8 group-hover:text-ash transition-colors" />
                        <h3 className="font-serif text-2xl mb-4 text-ash">The Hidden Link</h3>
                        <p className="text-stone/60 leading-relaxed text-sm">
                            A bridge between fabric and technology. A simple tap of your phone unlocks the hidden layer.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-10 border border-stone/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm group hover:border-stone/30 transition-all duration-500">
                        <Zap className="w-8 h-8 text-stone mb-8 group-hover:text-ash transition-colors" />
                        <h3 className="font-serif text-2xl mb-4 text-ash">Words of Power</h3>
                        <p className="text-stone/60 leading-relaxed text-sm">
                            Unlock a new message every day. Words of grit. Words of defiance. Reminders of who you are when the world tries to make you forget.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-10 border border-stone/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm group hover:border-stone/30 transition-all duration-500">
                        <Fingerprint className="w-8 h-8 text-stone mb-8 group-hover:text-ash transition-colors" />
                        <h3 className="font-serif text-2xl mb-4 text-ash">Authenticity</h3>
                        <p className="text-stone/60 leading-relaxed text-sm">
                            Verify your piece instantly. Join the exclusive Drotes community. No fakes. No noise.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

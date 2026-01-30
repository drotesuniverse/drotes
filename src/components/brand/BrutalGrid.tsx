"use client";

import { motion } from "framer-motion";

export default function BrutalGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full border-x border-black grid grid-cols-1 md:grid-cols-12 auto-rows-min md:max-w-7xl mx-auto">
            {children}

            {/* Background Grid Lines (Optional visual flair) */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5 flex justify-center">
                <div className="w-full max-w-7xl h-full border-x border-black grid grid-cols-12 gap-0">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-full border-r border-black/50" />
                    ))}
                </div>
            </div>
        </div>
    );
}

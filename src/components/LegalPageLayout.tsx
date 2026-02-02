"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LegalPageLayoutProps {
    title: string;
    subtitle?: string;
    lastUpdated?: string;
    children: React.ReactNode;
}

export default function LegalPageLayout({ title, subtitle, lastUpdated, children }: LegalPageLayoutProps) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-neutral-100" ref={containerRef}>
            {/* Minimal Header */}
            <div className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center mix-blend-difference text-white">
                <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-black">Back</span>
                </Link>
                <div className="font-bold tracking-tighter uppercase text-sm hidden md:block text-black">
                    D R O T E S
                </div>
            </div>

            {/* Parallax Hero */}
            <motion.section
                style={{ opacity: headerOpacity, y: headerY }}
                className="h-[50vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-neutral-900">{title}</h1>
                    {subtitle && <p className="text-neutral-500 max-w-md mx-auto text-lg font-medium">{subtitle}</p>}
                    {lastUpdated && <p className="text-neutral-400 text-xs uppercase tracking-widest mt-6">Last Updated: {lastUpdated}</p>}
                </motion.div>
            </motion.section>

            {/* Content Container */}
            <div className="max-w-3xl mx-auto px-6 pb-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="space-y-16"
                >
                    {children}
                </motion.div>
            </div>

            {/* Footer Contact Snippet */}
            <div className="border-t border-neutral-100 py-12 text-center bg-neutral-50 mt-12">
                <p className="text-neutral-400 text-sm mb-2">Need further assistance?</p>
                <a href="mailto:info@drotes.com" className="text-lg font-bold hover:underline underline-offset-4 decoration-neutral-300">
                    info@drotes.com
                </a>
            </div>
        </div>
    );
}

// Sub-components for consistent styling
export function LegalSection({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) {
    return (
        <section className="group">
            <div className="flex items-center gap-3 mb-6">
                {Icon && (
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-black group-hover:text-white transition-colors duration-500 shrink-0">
                        <Icon size={14} />
                    </div>
                )}
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            </div>
            <div className="text-neutral-600 leading-relaxed text-base space-y-4 pl-0 md:pl-11">
                {children}
            </div>
        </section>
    );
}

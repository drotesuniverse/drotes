"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface GallerySlideProps {
    type: "hero" | "product" | "video" | "shop";
    data?: any;
    index: number;
}

export default function GallerySlide({ type, data, index }: GallerySlideProps) {
    if (type === "hero") {
        return (
            <motion.section
                className="min-w-[100vw] h-screen snap-center relative flex items-center justify-center bg-neutral-200 border-r border-neutral-300"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className="text-center relative z-10 mix-blend-difference text-white">
                    <h1 className="font-[family-name:var(--font-bodoni)] text-[25vw] leading-[0.8] tracking-tighter">
                        ANEC
                    </h1>
                    <h1 className="font-[family-name:var(--font-bodoni)] text-[25vw] leading-[0.8] tracking-tighter italic ml-[0.5em]">
                        DOTE
                    </h1>
                </div>
                <div className="absolute bottom-12 left-12 text-black text-xs tracking-[0.3em] font-mono">
                    SCROLL RIGHT →
                </div>
            </motion.section>
        );
    }

    if (type === "product") {
        return (
            <motion.section
                className="min-w-[100vw] md:min-w-[80vw] h-screen snap-center relative grid grid-cols-1 md:grid-cols-2 bg-neutral-200 border-r border-neutral-300"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className="relative h-[60vh] md:h-full w-full">
                    <Image
                        src={data.image}
                        alt={data.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-8 md:p-16 flex flex-col justify-between">
                    <div>
                        <span className="block text-xs font-mono mb-4 text-neutral-500">00{index} — LOOK</span>
                        <h2 className="font-[family-name:var(--font-bodoni)] text-5xl md:text-7xl mb-6">{data.title}</h2>
                        <p className="max-w-md text-sm leading-relaxed text-neutral-600 mb-8">
                            Constructed from heavyweight cotton. Designed for silence.
                            The silhouette is oversized, dropping at the shoulder for a relaxed drape.
                        </p>
                        <div className="flex gap-4 text-xs font-mono uppercase text-neutral-500">
                            <span>Cotton 100%</span>
                            <span>•</span>
                            <span>Made in UAE</span>
                        </div>
                    </div>
                    <Link href={data.link} className="inline-block border-b border-black pb-1 text-sm uppercase tracking-widest hover:opacity-50 transition-opacity self-start">
                        View Product
                    </Link>
                </div>
            </motion.section>
        );
    }

    // Default Fallback
    return null;
}

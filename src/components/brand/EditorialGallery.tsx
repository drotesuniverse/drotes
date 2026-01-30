"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function EditorialGallery() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

    return (
        <section ref={container} className="min-h-screen bg-white py-24 overflow-hidden relative">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
                <motion.div style={{ y: y1 }} className="relative aspect-[3/4] w-full">
                    <Image
                        src="/assets/image1.jpg"
                        alt="Product 1"
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute bottom-4 left-4 text-black bg-white/80 backdrop-blur px-3 py-1 text-xs uppercase tracking-widest">
                        The Silhouette
                    </div>
                </motion.div>

                <div className="flex flex-col gap-12">
                    <motion.div style={{ y: y2 }} className="relative aspect-[3/4] w-2/3 ml-auto">
                        <Image
                            src="/assets/image3.jpg"
                            alt="Product 2"
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute bottom-4 left-4 text-black bg-white/80 backdrop-blur px-3 py-1 text-xs uppercase tracking-widest">
                            The Fabric
                        </div>
                    </motion.div>

                    <div className="max-w-md">
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-6">Built Different</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm md:text-base">
                            Every hoodie holds a story. A scar. A battle cry. It’s for the dreamers, the fighters, the ones who won’t stop until they prove their worth. Drotes is more than just something you wear — it’s who you are.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

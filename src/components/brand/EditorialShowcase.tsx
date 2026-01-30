"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const LOOKS = [
    {
        id: 1,
        title: "The Oversized Tee",
        image: "/assets/image1.jpg",
        link: "/shop/oversized-tee",
        align: "start"
    },
    {
        id: 2,
        title: "The Heavyweight Hoodie",
        image: "/assets/image2.jpg",
        link: "/shop/heavyweight-hoodie",
        align: "end"
    },
    {
        id: 3,
        title: "The Cargo Pant",
        image: "/assets/image3.jpg",
        link: "/shop/cargo-pant",
        align: "center"
    }
];

export default function EditorialShowcase() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <section ref={container} className="py-24 px-4 md:px-12 bg-obsidian relative z-10">
            <div className="max-w-[1600px] mx-auto space-y-32 md:space-y-48">
                {LOOKS.map((look, i) => (
                    <div
                        key={look.id}
                        className={`flex flex-col ${look.align === 'end' ? 'md:items-end' :
                                look.align === 'center' ? 'md:items-center' : 'md:items-start'
                            }`}
                    >
                        <Link href={look.link} className="group relative block w-full md:w-[45vw] lg:w-[35vw]">
                            <div className="overflow-hidden">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className="relative aspect-[3/4]"
                                >
                                    <Image
                                        src={look.image}
                                        alt={look.title}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-6 flex justify-between items-baseline border-b border-white/10 pb-4"
                            >
                                <h3 className="font-[family-name:var(--font-bodoni)] text-2xl md:text-3xl text-white">
                                    {look.title}
                                </h3>
                                <span className="text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                                    Shop Look
                                </span>
                            </motion.div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Background Parallax Element */}
            <motion.div
                style={{ y }}
                className="absolute top-1/4 right-10 w-[20vw] h-[30vh] md:w-[15vw] md:h-[40vh] bg-white/5 -z-10 hidden md:block"
            />
        </section>
    );
}

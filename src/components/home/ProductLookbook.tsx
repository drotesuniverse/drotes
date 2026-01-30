"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_SHOP_PRODUCTS } from "@/lib/queries";
import Image from "next/image";

export default function ProductLookbook() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { data, loading } = useQuery(GET_SHOP_PRODUCTS, {
        variables: { first: 3 }
    });

    const products = data?.products?.nodes || [];

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    return (
        <section ref={containerRef} className="bg-[#050505] py-32 px-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-end justify-between mb-20 border-b border-white/10 pb-8">
                    <div>
                        <span className="block text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">Collection 01</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">THE ARTIFACTS</h2>
                    </div>
                    <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-white hover:text-neutral-400 transition-colors">
                        View All <ArrowUpRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {loading ? (
                        // Loading Skeleton
                        [1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-white/5 mb-6" />
                                <div className="h-4 w-2/3 bg-white/5 mb-2" />
                                <div className="h-3 w-1/3 bg-white/5" />
                            </div>
                        ))
                    ) : (
                        products.map((product: any) => (
                            <ProductItem key={product.id} product={product} />
                        ))
                    )}
                </div>

                <div className="mt-16 text-center md:hidden">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white border-b border-white pb-1">
                        View All <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function ProductItem({ product }: { product: any }) {
    const cleanPrice = (price: string) => {
        if (!price) return "";
        return price.replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ');
    };

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden mb-6">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full relative"
                >
                    {product.image?.sourceUrl ? (
                        <Image
                            src={product.image.sourceUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-white/20 font-mono text-xs">
                            NO IMAGE
                        </div>
                    )}
                </motion.div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-neutral-400 transition-colors">{product.name}</h3>
                </div>
                <span className="text-sm font-mono text-neutral-300">
                    {cleanPrice(product.price)}
                </span>
            </div>
        </Link>
    );
}

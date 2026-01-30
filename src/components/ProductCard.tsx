"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductCardProps {
    name: string;
    slug: string;
    price: string | number;
    image: string;
    index?: number;
    category?: string;
    color?: string;
    swatches?: string[];
    secondaryImage?: string;
}

// Simple color map fallback
const COLOR_MAP: Record<string, string> = {
    "black": "#000000",
    "white": "#ffffff",
    "grey": "#808080",
    // New mappings based on seen slugs (formatted)
    "crimson dust red": "#9e1b32",
    "faded horizon blue": "#7fb5b7",
    "obsidian black": "#1a1a1a",
    "blue": "#0000ff",
    "navy": "#000080",
    "forest": "#228b22",
};

function getColorHex(name: string) {
    if (!name) return "#e5e5e5";
    const lower = name.toLowerCase();

    // Check direct match
    if (COLOR_MAP[lower]) return COLOR_MAP[lower];

    // Fuzzy matching
    if (lower.includes("red")) return "#ff0000";
    if (lower.includes("blue")) return "#6495ed";
    if (lower.includes("green")) return "#228b22";
    if (lower.includes("black")) return "#000000";
    if (lower.includes("white")) return "#ffffff";
    if (lower.includes("grey") || lower.includes("gray")) return "#808080";
    if (lower.includes("yellow")) return "#ffd700";

    return "#cccccc";
}

export default function ProductCard({ name, slug, price, image, secondaryImage, index = 0, category = "Collection 01", color, swatches = [] }: ProductCardProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    return (
        <Link href={`/products/${slug}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group cursor-pointer relative"
            >
                {/* Wishlist Toggle */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInWishlist(slug)) {
                            removeFromWishlist(slug);
                        } else {
                            addToWishlist({ id: slug, name, price, image, slug });
                        }
                    }}
                    className="absolute top-2 right-2 z-20 p-2 text-black/50 hover:text-red-500 transition-colors bg-white/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                >
                    <Heart size={16} fill={isInWishlist(slug) ? "currentColor" : "none"} />
                </button>

                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-4 rounded-sm">
                    {image ? (
                        <>
                            <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            {secondaryImage && (
                                <Image
                                    src={secondaryImage}
                                    alt={`${name} - Back`}
                                    fill
                                    className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300 font-bold text-2xl uppercase tracking-tighter group-hover:scale-105 transition-transform duration-700">
                            {name}
                        </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>

                <div className="flex justify-between items-start">
                    <div className="group-hover:scale-105 transition-transform duration-500 origin-left flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-black leading-tight">{name}</h3>

                            {/* Swatches Container */}
                            {swatches.length > 0 && (
                                <div className="flex gap-0.5">
                                    {swatches.map((swatchColor, i) => (
                                        <div
                                            key={i}
                                            title={swatchColor}
                                            className={`w-6 h-[5px] rounded-[1px] ${swatchColor === color ? 'ring-1 ring-neutral-300' : ''}`}
                                            style={{ backgroundColor: getColorHex(swatchColor) }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {color && <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-1">{color}</p>}
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">{category}</p>
                    </div>
                    {(price !== 0 && price !== "0") && (
                        <span className="text-sm font-bold text-black group-hover:text-emerald-700 transition-colors duration-300 ml-4">{price}</span>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}

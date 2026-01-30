"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    mainImage: string;
    galleryImages: string[];
    selectedVariationImage?: string;
}

export default function ProductGallery({ mainImage, galleryImages, selectedVariationImage }: ProductGalleryProps) {
    const images = [selectedVariationImage || mainImage, ...galleryImages].filter(Boolean);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    // Reset to index 0 when active image changes (e.g. variation switch)
    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedVariationImage]);

    // Slider Handlers
    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        let nextIndex = currentIndex + newDirection;
        if (nextIndex < 0) nextIndex = images.length - 1;
        if (nextIndex >= images.length) nextIndex = 0;
        setCurrentIndex(nextIndex);
    };

    // Zoom Logic
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imageRef.current) return;
        const { left, top, width, height } = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    return (
        <div className="flex flex-col gap-6 w-full select-none">
            {/* Main Stage */}
            <div
                ref={imageRef}
                className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden rounded-sm group isolate"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
            >
                {/* Image Slider */}
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                    >
                        <Image
                            src={images[currentIndex]}
                            alt="Product Image"
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            draggable={false}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Zoom Overlay (Only Desktop) */}
                <AnimatePresence>
                    {isZooming && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 pointer-events-none hidden md:block"
                            style={{
                                backgroundImage: `url(${images[currentIndex]})`,
                                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                                backgroundSize: "250%",
                                backgroundRepeat: "no-repeat"
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Controls (Arrows) */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                        className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-black pointer-events-auto hover:bg-white transition-colors shadow-lg active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); paginate(1); }}
                        className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-black pointer-events-auto hover:bg-white transition-colors shadow-lg active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Mobile Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden z-30">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? "bg-black" : "bg-black/20"}`}
                        />
                    ))}
                </div>
            </div>

            {/* Thumbnails (Horizontal Scroll) */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar w-full py-2">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                        className={`relative w-20 h-24 shrink-0 overflow-hidden border rounded-sm transition-all ${currentIndex === idx
                                ? "border-black opacity-100 ring-1 ring-black scale-[0.98]"
                                : "border-transparent opacity-60 hover:opacity-100 hover:scale-[0.98]"
                            }`}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="100px"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

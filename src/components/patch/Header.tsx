"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 transition-all duration-300 ${scrolled ? "bg-drotes-black/50 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
                {/* Left Nav (Desktop) */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="https://www.drotes.com" className="text-xs font-medium text-drotes-muted hover:text-white transition-colors uppercase tracking-[0.2em]">HOME</a>
                    <a href="https://www.drotes.com/shop" className="text-xs font-medium text-drotes-muted hover:text-white transition-colors uppercase tracking-[0.2em]">Collection</a>
                </nav>

                {/* Center Logo - Fixed Overflow */}
                <div className="flex justify-center w-full overflow-visible">
                    <a href="https://www.drotes.com" className={`relative transition-all duration-500 block ${scrolled ? "w-24" : "w-32"}`}>
                        <Image
                            src="/drotes-logo-new.png"
                            alt="Drotes"
                            width={160}
                            height={45}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </a>
                </div>
                {/* Right Nav */}
                <div className="flex justify-end">
                    <a href="https://www.drotes.com/shop" className="px-6 py-2 text-[10px] font-bold text-black bg-white rounded-full hover:bg-drotes-text transition-colors uppercase tracking-[0.2em]">
                        Shop
                    </a>
                </div>            </div>
        </motion.header>
    );
}

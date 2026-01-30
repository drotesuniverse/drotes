"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 text-black pointer-events-none"
        >
            <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto pointer-events-auto">

                {/* Minimal Nav */}
                <nav className="hidden md:flex items-center gap-12">
                    <Link href="https://www.drotes.com/shop" className="text-xs tracking-[0.2em] uppercase hover:opacity-50 transition-opacity">
                        Shop
                    </Link>
                    <Link href="/about" className="text-xs tracking-[0.2em] uppercase hover:opacity-50 transition-opacity">
                        About
                    </Link>
                </nav>

                {/* Centered Logo / Wordmark if needed, but Hero has massive text. Let's keep a small discreet logo just in case */}
                <Link href="/" className="block">
                    <span className="font-[family-name:var(--font-bodoni)] font-bold text-xl tracking-widest">
                        ANEC:DOTE
                    </span>
                </Link>

                {/* Cart / Menu Toggle */}
                <div className="flex items-center gap-6">
                    <button className="text-xs tracking-[0.2em] uppercase hover:opacity-50 transition-opacity">
                        Cart (0)
                    </button>
                </div>
            </div>
        </motion.header>
    );
}

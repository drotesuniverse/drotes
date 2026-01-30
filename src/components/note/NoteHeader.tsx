"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function NoteHeader() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setScrolled(latest > 50);
    });

    return (
        <>
            <motion.header
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center py-6 pointer-events-none transition-all duration-500"
            >
                {/* Centered Logo */}
                <div className="pointer-events-auto relative z-50 mb-6 h-12 w-36 hover:scale-105 transition-transform duration-300">
                    <Link href="/" className="block w-full h-full relative">
                        <Image
                            src="/drotes-logo.png"
                            alt="Drotes"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Navigation */}
                <nav
                    className={`hidden md:flex pointer-events-auto items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/5 px-2 py-1.5 rounded-full shadow-2xl transition-all duration-500 ${scrolled ? "bg-black/80 border-white/10" : ""}`}
                >
                    <NavLink href="https://www.drotes.com" label="Home" />
                    <div className="w-px h-3 bg-white/10" />
                    <NavLink href="https://www.drotes.com/shop" label="Shop" />
                    <div className="w-px h-3 bg-white/10" />
                    <NavLink href="https://www.drotes.com/patch" label="Drotes Patch" />
                    <div className="w-px h-3 bg-white/10" />
                    <NavLink href="#" label="Anec:dote" isActive />
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="absolute top-6 right-6 md:hidden pointer-events-auto">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-white"
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Nav Overlay */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex items-center justify-center md:hidden"
                >
                    <div className="flex flex-col items-center gap-8 text-white">
                        <Link href="https://www.drotes.com" className="text-2xl font-bold">Home</Link>
                        <Link href="https://www.drotes.com/shop" className="text-2xl font-bold">Shop</Link>
                        <Link href="#" className="text-2xl font-bold">Anec:dote</Link>
                    </div>
                </motion.div>
            )}
        </>
    );
}

function NavLink({ href, label, isActive }: { href: string, label: string, isActive?: boolean }) {
    return (
        <Link
            href={href}
            className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${isActive ? "bg-white text-black font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}
        >
            {label}
        </Link>
    );
}

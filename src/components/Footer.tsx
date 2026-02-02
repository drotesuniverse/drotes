"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { ArrowUpRight, Instagram, Twitter, Mail, ArrowRight, Globe, Lock, Youtube, Music2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import Link from "next/link";

export default function Footer() {
    const { settings } = useAdminSettings();
    return (
        <footer className="bg-[#050505] text-white pt-32 pb-12 px-6 md:px-12 border-t border-white/5 overflow-hidden font-[family-name:var(--font-poppins)]">
            <div className="max-w-[1800px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-32">

                    {/* Magnetic Branding Section */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        <div className="space-y-8">
                            <MagneticLogo />
                            <p className="max-w-[280px] text-neutral-500 text-xs uppercase tracking-[0.3em] leading-loose">
                                We do not sell garments. <br />
                                We archive the untold narrative of the modern nomad.
                            </p>
                        </div>
                    </div>

                    {/* Links Grid with Staggered Animation */}
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="flex flex-col gap-6"
                        >
                            <h4 className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.6em] mb-4">Archive</h4>
                            <FooterLink href="/shop">New Release</FooterLink>
                            <FooterLink href="/shop">Outerwear</FooterLink>
                            <FooterLink href="/shop">Accessories</FooterLink>
                            <FooterLink href="/shop">All Pieces</FooterLink>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                            }}
                            className="flex flex-col gap-6"
                        >
                            <h4 className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.6em] mb-4">Universe</h4>
                            <FooterLink href="https://anecdote.drotes.com" focus>Anecdote</FooterLink>
                            <FooterLink href="https://patch.drotes.com" focus>The Patch</FooterLink>
                            <FooterLink href="https://founder.drotes.com">Founder's Note</FooterLink>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
                            }}
                            className="flex flex-col gap-6"
                        >
                            <h4 className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.6em] mb-4">Service</h4>
                            <FooterLink href="/shipping">Shipping</FooterLink>
                            <FooterLink href="/returns">Returns</FooterLink>
                            <FooterLink href="/terms">Terms</FooterLink>
                            <FooterLink href="/privacy">Privacy</FooterLink>
                            <FooterLink href="/faq">FAQ</FooterLink>
                        </motion.div>
                    </div>

                    {/* Glass Newsletter Section */}
                    <div className="lg:col-span-4">
                        <div className="relative p-10 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:text-white/20 transition-colors">
                                <Mail size={40} strokeWidth={0.5} />
                            </div>

                            <h3 className="text-xl font-bold uppercase tracking-tighter mb-4">The Inner Circle</h3>
                            <p className="text-neutral-500 text-[10px] uppercase tracking-[0.4em] mb-10 leading-relaxed">
                                Be the first to know about private drops and seasonal archives.
                            </p>

                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="IDENTITY@ANECDOTE.COM"
                                    className="bg-transparent w-full border-b border-white/10 pb-4 text-xs uppercase tracking-widest focus:outline-none focus:border-white transition-colors placeholder:text-neutral-800"
                                />
                                <button className="absolute right-0 bottom-4 text-white hover:translate-x-2 transition-transform">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Info Ticker */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <LiveTicker />

                    <div className="flex gap-4">
                        {settings.socialLinks?.instagram && (
                            <SocialLink href={`https://instagram.com/${settings.socialLinks.instagram}`} icon={<Instagram size={18} strokeWidth={1.5} />} />
                        )}
                        {settings.socialLinks?.twitter && (
                            <SocialLink href={`https://twitter.com/${settings.socialLinks.twitter}`} icon={<Twitter size={18} strokeWidth={1.5} />} />
                        )}
                        {settings.socialLinks?.tiktok && (
                            <SocialLink href={`https://tiktok.com/@${settings.socialLinks.tiktok}`} icon={<Music2 size={18} strokeWidth={1.5} />} />
                        )}
                        {settings.socialLinks?.youtube && (
                            <SocialLink href={`https://youtube.com/@${settings.socialLinks.youtube}`} icon={<Youtube size={18} strokeWidth={1.5} />} />
                        )}
                    </div>

                    <div className="text-[9px] text-neutral-700 uppercase tracking-[0.5em] font-mono">
                        © 2026 ANEC:DOTE / ALL RIGHTS RESERVED
                    </div>
                </div>
            </div>
        </footer>
    );
}

function MagneticLogo() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set((e.clientX - centerX) * 0.4);
        mouseY.set((e.clientY - centerY) * 0.4);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className="w-fit cursor-none"
        >
            <h2 className="text-4xl font-bold lowercase tracking-tighter flex items-center">
                anec<span className="text-white/20">:</span>dote
                <div className="ml-4 w-2 h-2 bg-white rounded-full animate-pulse" />
            </h2>
        </motion.div>
    );
}

function FooterLink({ href, children, focus }: { href: string; children: React.ReactNode; focus?: boolean }) {
    const isExternal = href.startsWith("http");
    const content = (
        <div className="group flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-[0.3em] font-medium relative">
            <div className="w-1 h-1 bg-white scale-0 group-hover:scale-100 transition-transform rounded-full shrink-0" />
            {focus && (
                <div className="absolute -left-4 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-20" />
                    <div className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </div>
            )}
            <span className={focus ? "pl-2" : ""}>{children}</span>
            {isExternal && <ArrowUpRight size={10} className="opacity-20 group-hover:opacity-100 transition-opacity" />}
        </div>
    );

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
            }}
        >
            {isExternal ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {content}
                </a>
            ) : (
                <Link href={href}>
                    {content}
                </Link>
            )}
        </motion.div>
    );
}

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all group">
            <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                {icon}
            </motion.div>
        </a>
    );
}

function LiveTicker() {
    const [time, setTime] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-6 px-6 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            <div className="flex items-center gap-2">
                <Globe size={12} className="text-white/40" />
                <span>Global Ops / HQ</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
                <span className="text-white/80">{time}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                <span className="text-green-500/80">Systems Online</span>
            </div>
        </div>
    );
}

"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Heart,
    Plus,
    Minus,
    MousePointer2
} from "lucide-react";

// --- Components ---

// 1. Mixed Media Accordion Item
const PillarItem = ({ title, subtitle, desc, image, isOpen, onClick, index }: any) => {
    return (
        <div className="border-b border-neutral-300 group">
            <button
                onClick={onClick}
                className="w-full py-12 flex items-center justify-between text-left hover:pl-4 transition-all duration-300"
            >
                <div className="flex items-baseline gap-8">
                    <span className="text-xs font-mono text-neutral-400 group-hover:text-red-700 transition-colors">0{index + 1}</span>
                    <div className="relative">
                        <h3 className={`text-5xl md:text-7xl font-serif transition-colors duration-500 ${isOpen ? 'text-red-700 italic pr-8' : 'text-neutral-900 group-hover:text-neutral-600'}`}>
                            {title}
                        </h3>
                        {isOpen && <motion.div layoutId="underline" className="absolute -bottom-2 left-0 right-0 h-[2px] bg-red-700" />}
                    </div>
                </div>
                <div className={`w-12 h-12 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180 text-red-700' : 'text-neutral-300 group-hover:text-neutral-900'}`}>
                    {isOpen ? <Minus size={32} /> : <Plus size={32} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-12 grid md:grid-cols-2 gap-12 items-start">
                            <div className="pl-14 md:pl-20 max-w-xl text-xl text-neutral-600 leading-relaxed font-light">
                                <p className="mb-6">{subtitle}</p>
                                <p>{desc}</p>
                            </div>
                            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-sm grayscale group-hover:grayscale-0 transition-all duration-700">
                                <Image
                                    src={image}
                                    fill
                                    alt={title}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// 2. Vertical Impact Stream (Redesigned)
const ImpactStream = () => {
    return (
        <section className="bg-stone-100">
            {/* Item 1: Reach (White Theme) */}
            <div className="relative min-h-[90vh] flex flex-col md:flex-row items-center border-b border-neutral-200">
                <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center min-h-[50vh] md:h-[90vh] bg-[#F5F5F0] z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h3 className="text-[15vw] md:text-[12rem] font-serif leading-none text-neutral-900 tracking-tighter">
                            800k<span className="text-red-700 font-sans text-[0.5em] align-top">+</span>
                        </h3>
                        <div className="mt-8 border-l-2 border-red-700 pl-8">
                            <h4 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-neutral-400 mb-4">Global Reach</h4>
                            <p className="text-2xl md:text-4xl font-light text-neutral-800 leading-tight max-w-lg">
                                Silent battles fought every year. We ensure no one walks that path alone.
                            </p>
                        </div>
                    </motion.div>
                </div>
                <div className="w-full md:w-1/2 h-[50vh] md:h-[90vh] relative overflow-hidden group">
                    <Image
                        src="/images/imprint-hope.png"
                        fill
                        alt="Reach"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                    />
                </div>
            </div>

            {/* Item 2: Focus (Dark Theme) */}
            <div className="relative min-h-[90vh] flex flex-col-reverse md:flex-row items-center bg-neutral-900 text-white">
                <div className="w-full md:w-1/2 h-[50vh] md:h-[90vh] relative overflow-hidden group">
                    <Image
                        src="/images/imprint-silhouette.png"
                        fill
                        alt="Focus"
                        className="object-cover grayscale opacity-60 group-hover:opacity-100 transition-all duration-1000"
                    />
                </div>
                <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center min-h-[50vh] md:h-[90vh] z-10 relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <ArrowRight size={200} className="-rotate-45 text-white" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h3 className="text-[15vw] md:text-[12rem] font-serif leading-none tracking-tighter text-white">
                            75<span className="text-emerald-500 font-sans text-[0.5em] align-top">%</span>
                        </h3>
                        <div className="mt-8 border-l-2 border-emerald-500 pl-8">
                            <h4 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-neutral-500 mb-4">The Silent Crisis</h4>
                            <p className="text-2xl md:text-4xl font-light text-neutral-300 leading-tight max-w-lg">
                                Of critical mental health crises affect men. We redefine strength through vulnerability.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Item 3: Promise (Red Theme) */}
            <div className="relative py-40 bg-red-800 text-center text-white flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 px-6 max-w-4xl"
                >
                    <Heart size={80} className="mx-auto mb-12 text-red-300 animate-pulse" />
                    <h3 className="text-4xl md:text-7xl font-serif italic leading-tight mb-8">
                        "To build a world where asking for help is the bravest act of all."
                    </h3>
                    <p className="text-red-200 uppercase tracking-[0.3em] text-sm md:text-lg">The Drotes Promise</p>
                </motion.div>
            </div>
        </section>
    );
};


export default function DrotesImprintPage() {
    const [openPillar, setOpenPillar] = useState<number | null>(0);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const heroImageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
    const heroTextY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    // Light Theme Override
    useEffect(() => {
        document.body.style.backgroundColor = "#F5F5F0";
        return () => { document.body.style.backgroundColor = ""; };
    }, []);

    return (
        <main ref={containerRef} className="min-h-screen bg-[#F5F5F0] text-neutral-900 selection:bg-red-200 selection:text-red-900 font-sans overflow-x-hidden">
            <Navigation theme="light" />

            {/* --- HERO: Immersive Overlap --- */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ scale: heroImageScale }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src="/images/imprint-hope.png"
                        fill
                        alt="Hero Bg"
                        className="object-cover grayscale opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F0] via-[#F5F5F0]/60 to-transparent" />
                </motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32">
                    <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative text-center">
                        <span className="block text-sm md:text-base font-bold tracking-[0.5em] uppercase text-red-700 mb-8 animate-pulse">
                            Global Initiative · Est. 2026
                        </span>

                        <h1 className="flex flex-col items-center justify-center leading-[0.85] text-neutral-900 mix-blend-multiply">
                            <span className="text-[12vw] font-black uppercase tracking-tighter scale-y-110 mb-[-2vw]">DROTES</span>
                            <span className="text-[10vw] font-serif italic text-neutral-500 font-light z-10">Imprint.</span>
                        </h1>

                        <div className="mt-16 max-w-xl mx-auto text-center flex flex-col items-center gap-10">
                            <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed font-light">
                                We are weaving a safety net for the silent battles. A commitment to mental well-being, resilience, and radical self-acceptance.
                            </p>

                            <button
                                onClick={() => document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group relative flex items-center gap-4 px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-neutral-900/5 group-hover:bg-neutral-900/10 transition-colors" />
                                <div className="relative flex items-center justify-center w-3 h-3">
                                    <span className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75" />
                                    <span className="relative w-2 h-2 bg-red-600 rounded-full" />
                                </div>
                                <span className="relative text-sm font-bold uppercase tracking-[0.2em] text-neutral-900">Make an Imprint</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- THE PLEDGE: Minimalist Type --- */}
            <section className="py-32 px-6 bg-white relative z-10">
                <div className="max-w-5xl mx-auto text-center border-y border-neutral-100 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-5xl md:text-8xl font-serif text-neutral-900 leading-none mb-10">
                            The 1%<br />
                            <span className="text-red-700 italic font-light">Pledge.</span>
                        </h2>
                        <p className="text-xl md:text-3xl font-light text-neutral-600 leading-relaxed max-w-3xl mx-auto">
                            Every purchase carries a deeper purpose. We commit <span className="font-normal text-neutral-900 border-b-2 border-red-200">1% of drotes annual gross sales</span> directly to initiatives providing critical mental health support and crisis intervention.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- THE FOUNDATION: Context Section (New) --- */}
            <section className="py-32 px-6 bg-[#EBEBE5]">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <div className="relative h-[600px] w-full overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-1000">
                        <Image
                            src="/images/imprint-silhouette.png"
                            fill
                            alt="Foundation"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-neutral-900/10" />
                    </div>
                    <div>
                        <span className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-400 mb-6 block">The Origin</span>
                        <h2 className="text-5xl md:text-6xl font-serif text-neutral-900 mb-8 leading-tight">
                            More Than a Label.<br />
                            <span className="italic text-neutral-500">A Vehicle for Change.</span>
                        </h2>
                        <div className="space-y-6 text-lg text-neutral-600 font-light leading-loose">
                            <p>
                                <strong className="text-neutral-900 font-medium">Drotes</strong> was born from a desire to create something tangible—clothing that speaks to identity and resilience. But fashion without purpose is fleeting.
                            </p>
                            <p>
                                <strong className="text-neutral-900 font-medium">Drotes Imprint</strong> is the heartbeat of that purpose. It is the mechanism through which our commercial success fuels social impact. Every collection released is a direct contribution to this fund, ensuring that as we grow, our capacity to heal grows with us.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- IMPACT: Vertical Stream --- */}
            <ImpactStream />

            {/* --- PILLARS: Mixed Media Accordion --- */}
            <section className="py-40 px-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-neutral-900 pb-8">
                    <div>
                        <span className="text-xs font-bold tracking-[0.3em] uppercase text-red-700">Our Pillars</span>
                        <h2 className="text-6xl md:text-8xl font-serif mt-4 text-neutral-900 leading-none">Action<br />Plan</h2>
                    </div>
                    <p className="text-neutral-500 max-w-xs text-right hidden md:block">
                        A comprehensive approach to mental health support, combining awareness, intervention, and community.
                    </p>
                </div>

                <div>
                    {[
                        {
                            title: "Normalize",
                            subtitle: "Ending the stigma.",
                            desc: "We challenge the silence surrounding mental health. Through storytelling and public campaigns, we foster environments where vulnerability is seen as courage, not weakness.",
                            image: "/images/imprint-silhouette.png"
                        },
                        {
                            title: "Support",
                            subtitle: "Direct crisis intervention.",
                            desc: "Funding 24/7 crisis lines and accessible therapy programs. Making sure that when someone reaches out, there is always a hand to hold them.",
                            image: "/images/imprint-hope.png"
                        },
                        {
                            title: "Connect",
                            subtitle: "Building safe communities.",
                            desc: "Creating physical and digital spaces for shared experiences. No one should have to walk through the darkness alone.",
                            image: "/images/imprint-community.png"
                        }
                    ].map((item, i) => (
                        <PillarItem
                            key={i}
                            {...item}
                            index={i}
                            isOpen={openPillar === i}
                            onClick={() => setOpenPillar(openPillar === i ? null : i)}
                        />
                    ))}
                </div>
            </section>

            {/* --- PARALLAX QUOTE BREAK --- */}
            <section className="relative h-[80vh] overflow-hidden flex items-center justify-center">
                <motion.div className="fixed inset-0 z-0">
                    <Image
                        src="/images/imprint-community.png"
                        fill
                        alt="Community"
                        className="object-cover grayscale opacity-20"
                    />
                </motion.div>

                <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#F5F5F0] via-transparent to-[#F5F5F0]" />

                <div className="relative z-20 p-6 text-center max-w-5xl">
                    <p className="text-4xl md:text-7xl font-serif text-neutral-800 leading-tight drop-shadow-sm mix-blend-multiply">
                        "The bravest thing you can do is ask for help. Your story isn't over yet."
                    </p>
                </div>
            </section>

            {/* --- DONATE: Immersive Split Redesign --- */}
            <section id="donate" className="relative min-h-[90vh] flex flex-col md:flex-row bg-neutral-900 text-white z-30">
                {/* Left: Image Scale */}
                <div className="flex-1 relative min-h-[50vh] md:min-h-auto overflow-hidden group">
                    <Image
                        src="/images/imprint-hope.png"
                        fill
                        alt="Donate"
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Right: Content */}
                <div className="flex-1 flex flex-col justify-center p-12 md:p-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />

                    <div className="relative z-10 max-w-xl">
                        <Heart size={48} className="text-red-500 mb-10" />

                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
                            Shape a<br />
                            <span className="text-red-500">Kinder Society.</span>
                        </h2>

                        <p className="text-lg text-neutral-400 leading-relaxed mb-12">
                            The initiative is sustained through the generosity of individuals like you. Be the bridge between silence and support.
                        </p>

                        <a
                            href="https://www.zeffy.com/en-CA/donation-form/donate-to-change-lives-7929"
                            target="_blank"
                            className="group relative inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-bold tracking-[0.2em] uppercase overflow-hidden"
                        >
                            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Donate Now</span>
                            <ArrowRight className="relative z-10 group-hover:text-white transition-colors duration-300" size={18} />
                            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

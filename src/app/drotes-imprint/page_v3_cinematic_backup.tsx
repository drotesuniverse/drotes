"use client";

import React, { useRef, useState, useEffect } from "react";
import createGlobe from "cobe";
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useVelocity } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
    Heart,
    Globe,
    ArrowRight,
    ArrowUpRight,
    Activity,
    Users,
    MessageCircle,
    Phone,
    Shield,
    Sparkles,
    Brain,
    Fingerprint,
    Zap,
    HandHeart
} from "lucide-react";

// --- Components ---

// 1. Cobe Globe Component
const Globe3D = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        let width = 0;

        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener('resize', onResize);
        onResize();

        const globe = createGlobe(canvasRef.current!, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.1],
            markerColor: [0.1, 1, 0.5],
            glowColor: [0.05, 0.2, 0.1],
            opacity: 1,
            markers: [
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.0060], size: 0.03 },
                { location: [51.5074, -0.1278], size: 0.03 },
                { location: [35.6762, 139.6503], size: 0.03 },
                { location: [-33.8688, 151.2093], size: 0.03 },
                { location: [48.8566, 2.3522], size: 0.03 },
                { location: [19.4326, -99.1332], size: 0.03 },
                { location: [-23.5505, -46.6333], size: 0.03 },
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.003;
                state.width = width * 2;
                state.height = width * 2;
            }
        });

        setTimeout(() => (canvasRef.current!.style.opacity = '1'));
        return () => globe.destroy();
    }, []);

    return (
        <div className="w-full max-w-[600px] aspect-square relative mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl opacity-20 animate-pulse" />
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', opacity: 0, transition: 'opacity 1s ease' }}
            />
        </div>
    );
};

// 2. Animated Counter
const CinematicCounter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView || !ref.current) return;

        let start = 0;
        const end = value;
        const duration = 2000;
        const startTime = performance.now();

        const update = (now: number) => {
            const time = now - startTime;
            const progress = Math.min(time / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * ease);

            if (ref.current) {
                ref.current.textContent = current.toLocaleString() + suffix;
            }

            if (progress < 1) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }, [isInView, value, suffix]);

    return <span ref={ref} className="font-mono tabular-nums tracking-tighter">0{suffix}</span>;
}

// 3. Tilt Card
const TiltCard = ({ children, className = "", image }: { children: React.ReactNode, className?: string, image?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useSpring(0, { stiffness: 150, damping: 20 });
    const y = useSpring(0, { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 15);
        y.set(yPct * -15);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX: y, rotateY: x }}
            className={`transition-shadow relative overflow-hidden ${className}`}
        >
            {image && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={image}
                        alt="Background"
                        fill
                        className="object-cover opacity-50 transition-opacity grayscale duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
            )}
            <div className="relative z-10 h-full flex flex-col justify-between">
                {children}
            </div>
        </motion.div>
    );
};

// 4. Parallax Text
const ParallaxText = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="overflow-hidden">
            <motion.div
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                {children}
            </motion.div>
        </div>
    )
}

// 5. Icon Marquee
const IconMarquee = () => {
    return (
        <div className="relative flex overflow-hidden py-10 bg-neutral-900 border-y border-white/5">
            <motion.div
                animate={{ x: "-50%" }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                className="flex gap-20 whitespace-nowrap px-10"
            >
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-20 items-center text-neutral-600">
                        <Activity size={48} />
                        <span className="text-2xl font-black uppercase tracking-widest text-emerald-900">Hope</span>
                        <Brain size={48} />
                        <span className="text-2xl font-black uppercase tracking-widest text-emerald-900">Strength</span>
                        <Heart size={48} />
                        <span className="text-2xl font-black uppercase tracking-widest text-emerald-900">Compassion</span>
                        <Users size={48} />
                        <span className="text-2xl font-black uppercase tracking-widest text-emerald-900">Unity</span>
                        <Fingerprint size={48} />
                        <span className="text-2xl font-black uppercase tracking-widest text-emerald-900">Identity</span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

// 6. 1% Pledge Unique Section (New)
const PledgeSection = () => {
    return (
        <section className="relative py-32 flex items-center justify-center overflow-hidden bg-emerald-950">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-5xl mx-auto px-6 text-center"
            >
                <div className="inline-block mb-8 p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <HandHeart size={48} className="mx-auto" />
                </div>

                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 drop-shadow-2xl">
                    THE 1% <span className="text-emerald-500">PLEDGE</span>
                </h2>

                <p className="text-xl md:text-2xl text-emerald-100/80 max-w-3xl mx-auto leading-relaxed font-light">
                    Every purchase you make carries a deeper purpose. We commit <span className="text-white font-bold">1% of our annual gross sales</span> directly to initiatives that provide critical mental health support and crisis intervention.
                </p>

                <div className="mt-12 flex justify-center gap-4">
                    <div className="flex -space-x-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`w-12 h-12 rounded-full border-2 border-emerald-900 bg-emerald-800 flex items-center justify-center`}>
                                <Users size={20} className="text-emerald-200" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col justify-center text-left">
                        <span className="text-white font-bold block leading-none">Making a Real Impact</span>
                        <span className="text-xs text-emerald-400 uppercase tracking-wider">Together with you</span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

// 7. Donate Section (New)
const DonateSection = () => {
    return (
        <section className="relative py-32 px-6 flex items-center justify-center bg-neutral-900 border-y border-white/5">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-4xl mx-auto text-center bg-black/50 backdrop-blur-md p-12 rounded-3xl border border-white/10 shadow-2xl"
            >
                <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
                    <Heart size={32} className="fill-current" />
                </div>

                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">
                    SHAPE A <span className="text-red-500">KINDER SOCIETY</span>
                </h2>

                <div className="text-lg text-neutral-400 space-y-6 leading-relaxed mb-10">
                    <p>
                        Drotes Imprint was founded from a deep commitment to mental well-being and self-acceptance. Its purpose is to make mental health support and education more accessible to young people across communities and backgrounds.
                    </p>
                    <p>
                        To support this mission, <span className="text-white font-bold">1% of every Drotes sale</span> is reinvested into Drotes Imprint. The initiative is further sustained through the generosity of philanthropic foundations, individuals, corporate partners, and the broader community.
                    </p>
                    <p className="font-medium text-white">
                        Join us in shaping a kinder, healthier society—together.
                    </p>
                </div>

                <a
                    href="https://www.zeffy.com/en-CA/donation-form/donate-to-change-lives-7929"
                    target="_blank"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                >
                    Donate Now <ArrowRight size={20} />
                </a>
            </motion.div>
        </section>
    );
};

export default function DrotesImprintPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Parallax values
    const heroTextY = useTransform(scrollYProgress, [0, 0.4], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const imageParallax = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    // Sticky Nav Override
    useEffect(() => {
        document.body.style.backgroundColor = "#000";
        return () => { document.body.style.backgroundColor = ""; };
    }, []);

    return (
        <main
            ref={containerRef}
            className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden"
        >
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none z-50 mix-blend-overlay" />

            <Navigation theme="dark" />

            {/* --- HERO: The Global Connection --- */}
            <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center z-0 opacity-60 md:opacity-100"
                >
                    <Globe3D />
                </motion.div>

                <div className="relative z-10 text-center w-full max-w-7xl px-6 pointer-events-none">
                    <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
                        <h1 className="text-[15vw] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 mb-6 mix-blend-exclusion">
                            IMPRINT
                        </h1>
                        <p className="text-xl md:text-2xl font-light tracking-[0.3em] text-emerald-500 uppercase">
                            The Global Mental Health Initiative
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- 1% PLEDGE SECTION (New Prominent Location) --- */}
            <PledgeSection />

            {/* --- MARQUEE --- */}
            <IconMarquee />

            {/* --- MISSION: Cinematic Stats (Refined Language) --- */}
            <section className="min-h-screen flex items-center justify-center relative bg-black z-10 px-6 py-24">
                <div className="w-full max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="sticky top-32">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-emerald-500 mb-4"
                                >
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-mono uppercase">Live Data Estimate</span>
                                </motion.div>
                                <div className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
                                    <ParallaxText>THE</ParallaxText>
                                    <ParallaxText>SILENT</ParallaxText>
                                    <ParallaxText><span className="text-emerald-500">BATTLE</span></ParallaxText>
                                </div>
                                <p className="text-lg text-neutral-400 max-w-md leading-relaxed">
                                    Mental health challenges often go unseen. While you read this, someone is reaching their breaking point. We create a path to light.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-24">
                            {/* Stat 1 with Image */}
                            <TiltCard
                                image="/images/imprint-hope.png"
                                className="h-[400px] p-10 border border-white/10 rounded-2xl bg-neutral-900/50 backdrop-blur-sm group hover:border-emerald-500/50 transition-all cursor-crosshair shadow-2xl"
                            >
                                <div className="text-sm font-mono text-neutral-300 mb-2 group-hover:text-emerald-400 font-bold uppercase tracking-widest">Global Reach</div>
                                <div className="mt-auto">
                                    <div className="text-6xl md:text-7xl font-bold text-white mb-4 group-hover:scale-105 transition-transform origin-left drop-shadow-lg">
                                        <CinematicCounter value={800000} suffix="+" />
                                    </div>
                                    <p className="text-sm text-neutral-200 drop-shadow-md font-medium">
                                        Individuals struggle in silence every year. We believe that no one should have to face the darkness alone.
                                    </p>
                                </div>
                            </TiltCard>

                            {/* Stat 2 with Image */}
                            <TiltCard
                                image="/images/imprint-silhouette.png"
                                className="h-[400px] p-10 border border-white/10 rounded-2xl bg-neutral-900/50 backdrop-blur-sm group hover:border-emerald-500/50 transition-all cursor-crosshair shadow-2xl"
                            >
                                <div className="text-sm font-mono text-neutral-300 mb-2 group-hover:text-emerald-400 font-bold uppercase tracking-widest">Focus Area</div>
                                <div className="mt-auto">
                                    <div className="text-6xl md:text-7xl font-bold text-white mb-4 group-hover:scale-105 transition-transform origin-left drop-shadow-lg">
                                        <CinematicCounter value={75} suffix="%" />
                                    </div>
                                    <p className="text-sm text-neutral-200 drop-shadow-md font-medium">
                                        Of critical crises affect men. We foster environments where vulnerability is seen as courage, not weakness.
                                    </p>
                                </div>
                            </TiltCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PARALLAX IMAGE BREAK --- */}
            <section className="relative h-[60vh] overflow-hidden flex items-center justify-center">
                <motion.div style={{ y: imageParallax }} className="absolute inset-0">
                    <Image
                        src="/images/imprint-community.png"
                        alt="Parallax Bg"
                        fill
                        className="object-cover opacity-50 grayscale"
                    />
                </motion.div>
                <div className="relative z-10 text-center max-w-4xl px-6">
                    <p className="text-3xl md:text-5xl font-light italic leading-relaxed text-white drop-shadow-2xl">
                        "The bravest thing you can do is ask for help. Your story isn't over yet."
                    </p>
                </div>
            </section>

            {/* --- PILLARS --- */}
            <section className="py-32 overflow-hidden bg-neutral-950 relative border-y border-white/5">
                <div className="max-w-6xl mx-auto px-6 mb-20 flex items-end gap-6">
                    <h2 className="text-4xl font-bold uppercase tracking-widest text-neutral-700">Action Plan</h2>
                    <div className="h-[1px] flex-1 bg-neutral-800 mb-4" />
                </div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-1">
                    {[
                        { title: "Normalize", desc: "Vulnerability is strength.", icon: <Users size={32} /> },
                        { title: "Support", desc: "Crisis lines & therapy.", icon: <Activity size={32} /> },
                        { title: "Connect", desc: "Safe spaces for all.", icon: <MessageCircle size={32} /> },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="group relative h-96 bg-neutral-900 border border-white/5 p-8 flex flex-col justify-end overflow-hidden hover:border-emerald-500 transition-colors"
                        >
                            <div className="absolute top-8 right-8 text-neutral-700 group-hover:text-emerald-500 transition-colors group-hover:scale-110 duration-500">
                                {item.icon}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <h3 className="text-3xl font-black uppercase mb-4 relative z-10 group-hover:translate-x-2 transition-transform">{item.title}</h3>
                            <p className="text-neutral-400 group-hover:text-white transition-colors relative z-10 group-hover:translate-x-2 transition-transform delay-75">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- DONATE SECTION (Added) --- */}
            <DonateSection />

            {/* --- CTA --- */}
            <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black animate-pulse" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center z-10 p-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-8 font-mono text-xs animate-bounce">
                        <Sparkles size={12} />
                        JOIN THE MOVEMENT
                    </div>

                    <h2 className="text-5xl md:text-9xl font-black tracking-tighter mb-12 text-white mix-blend-difference">
                        WEAR YOUR<br /> VALUES
                    </h2>

                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Link
                            href="/shop"
                            className="group relative px-12 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-full overflow-hidden hover:scale-105 transition-transform duration-300"
                        >
                            <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all">
                                Shop Collection <ArrowRight size={18} />
                            </span>
                            <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                        </Link>

                        <a
                            href="https://findahelpline.com/"
                            target="_blank"
                            className="px-12 py-5 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white/10 hover:border-white transition-all flex items-center gap-3"
                        >
                            <Globe size={18} />
                            Global Resources
                        </a>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </main>
    );
}

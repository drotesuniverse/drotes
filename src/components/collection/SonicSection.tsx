"use client";

import { motion } from "framer-motion";
import { Play, Pause, Volume2, Volume1, BadgeCheck, Disc } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function SonicSection() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial load volume
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (newVolume: number) => {
        const clamp = Math.max(0, Math.min(1, newVolume));
        setVolume(clamp);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 100;
            setProgress((current / duration) * 100);
        }
    };

    return (
        <section className="py-40 px-6 relative z-20 flex flex-col items-center justify-center min-h-[80vh] bg-[#050505] overflow-hidden">
            {/* Section-Wide Torch Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_transparent_60%)] pointer-events-none mix-blend-screen animate-pulse-slow" />

            <div className="text-center mb-16 space-y-6 max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400"
                >
                    <BadgeCheck size={16} className="fill-blue-500/20" />
                    <span className="text-xs font-bold uppercase tracking-widest">Official Release</span>
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="text-5xl md:text-7xl font-light text-white leading-none tracking-tight"
                >
                    Drotes <span className="text-white/30 italic font-serif">Original</span>
                </motion.h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-5xl relative overflow-hidden rounded-[3rem] border border-white/20 bg-white/5 backdrop-blur-2xl shadow-[0_20px_100px_rgba(255,255,255,0.05)] p-10 md:p-20 flex flex-col md:flex-row items-center gap-16 group isolate"
            >
                {/* Left: Giant Spinner */}
                <div className="relative">
                    <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                        className="w-56 h-56 md:w-72 md:h-72 rounded-full border-[1px] border-white/10 bg-black/50 flex items-center justify-center relative shadow-2xl overflow-hidden backdrop-blur-md"
                    >
                        <div className="absolute inset-0 bg-[repeating-radial-gradient(#222_0,#111_2px)] opacity-20" />
                        <Image src="/drotes-logo.png" alt="Cover" width={200} height={200} className="object-contain opacity-60 scale-125 relative z-10" />
                        {/* Disc Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full z-20 pointer-events-none" />
                    </motion.div>

                    {/* Play Overlay Button */}
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center z-30 group/btn"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:bg-white hover:text-black transition-all duration-300"
                        >
                            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                        </motion.div>
                    </button>
                </div>

                {/* Right: Controls & Details */}
                <div className="flex-1 w-full space-y-10 relative z-10 text-center md:text-left">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-white/60 mb-2">
                            <Disc size={16} className="animate-spin-slow" />
                            <span className="text-xs font-mono uppercase tracking-widest">Now Playing</span>
                        </div>
                        <h3 className="text-4xl md:text-6xl font-medium text-white tracking-tighter">Anecdote 01.mp3</h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-6">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group/progress">
                            <motion.div
                                className="h-full bg-white shadow-[0_0_20px_white] relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                            </motion.div>
                        </div>

                        {/* Time & Volume */}
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-mono text-white/50">00:{Math.floor(progress / 100 * 60).toString().padStart(2, '0')} / 03:45</div>
                            <div className="flex items-center gap-3 w-32">
                                <Volume1 size={16} className="text-white/40" />
                                <div className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-white/80 group-hover:bg-white transition-colors"
                                        style={{ width: `${volume * 100}%` }}
                                    />
                                    <input
                                        type="range" min="0" max="1" step="0.1" value={volume}
                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <Volume2 size={16} className="text-white/40" />
                            </div>
                        </div>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    src="/music/drotes.mp3"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => { setIsPlaying(false); setProgress(0); }}
                />
            </motion.div>
        </section>
    );
}

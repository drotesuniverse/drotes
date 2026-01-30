"use client";

import { motion } from "framer-motion";
import { Play, Pause, Volume2, Volume1 } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function SonicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial load volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
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
        <section className="py-24 px-6 relative z-20">
            <div className="max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-white/10 via-black/40 to-black/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-8 md:p-12"
                >
                    {/* Frozen Reflection Glare */}
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

                    {/* Content Grid */}
                    <div className="relative z-10 flex flex-col gap-8">

                        {/* Header: Branding */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 opacity-90">
                                <div className="w-10 h-10 relative">
                                    <Image
                                        src="/drotes-logo.png"
                                        alt="Drotes"
                                        fill
                                        className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                    />
                                </div>
                                <span className="text-xl font-light tracking-widest text-white uppercase drop-shadow-md">Drotes</span>
                            </div>
                            <div className="px-3 py-1 rounded-full border border-white/10 bg-black/20 text-[10px] text-white/50 tracking-[0.2em] font-mono">
                                SONIC ID
                            </div>
                        </div>

                        {/* Main Interaction Area */}
                        <div className="flex items-center gap-8">
                            {/* Spinning Disc */}
                            <motion.div
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                className="w-24 h-24 shrink-0 rounded-full border border-white/10 bg-black/50 shadow-2xl flex items-center justify-center relative group"
                            >
                                <div className="absolute inset-0 rounded-full border border-white/5 opacity-50" />
                                <div className="absolute inset-2 rounded-full border border-white/10 opacity-30" />
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <div className="w-2 h-2 rounded-full bg-white/50" />
                                </div>
                            </motion.div>

                            {/* Track Info & Visuals */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl text-white font-medium tracking-tight mb-1">Sonic Identity</h3>
                                    <p className="text-white/40 text-sm">Collection 01 • Original Sound</p>
                                </div>

                                {/* Simulated Visualizer */}
                                <div className="flex items-end gap-[3px] h-8 opacity-60">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: isPlaying ? [4, Math.random() * 24 + 4, 4] : 4,
                                                opacity: isPlaying ? [0.4, 0.8, 0.4] : 0.3
                                            }}
                                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                                            className="w-1 bg-white rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-col gap-4">
                            {/* Progress Bar (Visual Only) */}
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white blur-[1px]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                {/* Play Button */}
                                <button
                                    onClick={togglePlay}
                                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                                </button>

                                {/* Volume Controls */}
                                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                                    <button
                                        onClick={() => handleVolumeChange(volume - 0.1)}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <Volume1 size={18} />
                                    </button>

                                    <div className="w-20 h-1 bg-white/10 rounded-full relative group cursor-pointer overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-white/80 group-hover:bg-white transition-colors"
                                            style={{ width: `${volume * 100}%` }}
                                        />
                                        <input
                                            type="range" min="0" max="1" step="0.1" value={volume}
                                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                        />
                                    </div>

                                    <button
                                        onClick={() => handleVolumeChange(volume + 0.1)}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <Volume2 size={18} />
                                    </button>
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
            </div>
        </section>
    );
}

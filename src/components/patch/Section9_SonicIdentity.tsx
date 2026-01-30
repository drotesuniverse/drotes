"use client";

import { motion } from "framer-motion";
import { Play, Pause, Disc } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Section9_SonicIdentity() {
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };





    // Auto-update state if audio ends
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;




        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <section className="py-32 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-10 md:p-16 rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group"
                >
                    {/* Background Ambient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-900/10 via-transparent to-blue-900/10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                    {/* Branding Tag */}


                    {/* Left: Vinyl / Disc Visual */}
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={{ duration: 3, ease: "linear", repeat: isPlaying ? Infinity : 0 }}
                            className="w-40 h-40 md:w-48 md:h-48 rounded-full border border-white/10 flex items-center justify-center bg-black/80 backdrop-blur-md relative z-10 shadow-2xl"
                        >
                            {/* Vinyl Grooves */}
                            <div className="absolute inset-2 rounded-full border border-white/5" />
                            <div className="absolute inset-4 rounded-full border border-white/5" />
                            <div className="absolute inset-6 rounded-full border border-white/5" />

                            {/* Center Label / Logo */}
                            <Disc className={`text-white/80 ${isPlaying ? "opacity-100" : "opacity-50"} transition-opacity duration-500`} size={64} strokeWidth={1} />
                        </motion.div>

                        {/* Pulse effect when playing */}
                        {isPlaying && (
                            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
                        )}
                    </div>

                    {/* Right: Controls & Info */}
                    <div className="flex-1 text-center md:text-left z-10 w-full">
                        <span className="block text-xs font-mono text-drotes-muted tracking-widest uppercase mb-4">
                            Sonic Identity
                        </span>
                        <h3 className="text-3xl md:text-4xl font-light text-white mb-2">
                            The Sound of Drotes
                        </h3>
                        <p className="text-drotes-muted text-sm mb-8 font-light max-w-md mx-auto md:mx-0">
                            Experience the audio signature of the collection.
                        </p>

                        <div className="flex flex-col items-center md:items-start gap-6">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={togglePlay}
                                    className="w-16 h-16 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 transition-transform duration-300 shadow-lg shadow-white/10"
                                >
                                    {isPlaying ? (
                                        <Pause size={24} fill="currentColor" />
                                    ) : (
                                        <Play size={24} fill="currentColor" className="ml-1" />
                                    )}
                                </button>


                            </div>

                            {/* Audio Visualizer Bars (Simulated) */}
                            <div className="h-12 flex items-center gap-1 mt-4 opacity-50">
                                {[...Array(24)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: isPlaying ? [8, Math.random() * 32 + 8, 8] : 4,
                                            opacity: isPlaying ? [0.3, 0.8, 0.3] : 0.2
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            repeat: Infinity,
                                            delay: i * 0.05
                                        }}
                                        className="w-1 bg-white rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <audio ref={audioRef} src="/music/drotes.mp3" />
                </motion.div>
            </div>
        </section>
    );
}

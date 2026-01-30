"use client";
import React, { useState, useEffect } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function PopupManager() {
    const { settings } = useAdminSettings();
    const [isVisible, setIsVisible] = useState(false);
    const [hasSeen, setHasSeen] = useState(false);

    useEffect(() => {
        // Show if enabled and not seen yet (in this session)
        if (settings.popup.enabled && !hasSeen) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000); // 2 second delay
            return () => clearTimeout(timer);
        }
    }, [settings.popup.enabled, hasSeen]);

    const handleClose = () => {
        setIsVisible(false);
        setHasSeen(true);
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate Success
        alert("Welcome to the Inner Circle.");
        handleClose();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-md h-fit bg-red z-[101] p-1"
                    >
                        <div className="relative bg-white text-black p-8 md:p-12 text-center border border-black overflow-hidden group">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black to-transparent opacity-20" />

                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">
                                {settings.popup.title}
                            </h2>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest leading-relaxed mb-8 max-w-xs mx-auto">
                                {settings.popup.text}
                            </p>

                            <form onSubmit={handleJoin} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder={settings.popup.placeholder || "ENTER EMAIL ACCESS CODE"}
                                    required
                                    className="w-full bg-neutral-100 border border-transparent focus:bg-white focus:border-black p-3 text-center text-xs uppercase tracking-widest transition-all outline-none"
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-[0.98]"
                                >
                                    {settings.popup.buttonText || "Unlock Access"}
                                </button>
                            </form>

                            <div className="mt-6 text-[9px] text-neutral-300 uppercase tracking-widest">
                                Limited Availability
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

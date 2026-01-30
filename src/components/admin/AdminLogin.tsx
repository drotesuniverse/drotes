"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

interface AdminLoginProps {
    onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "simply4joke") {
            onLogin();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="mb-8 text-center">
                    <h2 className="text-xl font-mono text-white/90 tracking-widest uppercase mb-2">
                        System Access
                    </h2>
                    <p className="text-xs font-mono text-white/40">
                        Authorization Required // Level 2
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="ENTER SECURITY KEY"
                            className={`w-full bg-neutral-900/50 border ${error ? "border-red-500/50" : "border-white/10 group-hover:border-white/20"
                                } text-white px-4 py-4 text-center font-mono text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20 tracking-widest`}
                            autoFocus
                        />
                        {error && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-mono text-red-500 tracking-wider"
                            >
                                ACCESS DENIED
                            </motion.span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-black font-mono text-xs uppercase tracking-widest py-4 hover:bg-neutral-200 transition-colors"
                    >
                        Authenticate
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

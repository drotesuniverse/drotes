"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Info, Lock, ArrowRight, X, User, Loader2, Mail, CheckCircle } from "lucide-react";
import { useMutation } from "@apollo/client";
import { REGISTER_CUSTOMER_MUTATION } from "@/lib/queries";

// NOTE: Using Custom WordPress Endpoints for OTP as requested.
// Endpoints: /wp-json/drotes/v1/otp/send  &  /wp-json/drotes/v1/otp/verify

export default function MembersOnlyPage() {
    const { settings, isLoaded } = useAdminSettings();
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({ d: 0, h: 0, m: 0, s: 0 });
    const [showInfo, setShowInfo] = useState(false);
    const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null);

    // Auth Mutations
    const [register, { loading: regLoading, error: regError }] = useMutation(REGISTER_CUSTOMER_MUTATION);

    // Form State
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");

    // Auth Flow State
    const [otpSent, setOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [restLoading, setRestLoading] = useState(false);
    const [restError, setRestError] = useState("");

    // Countdown Logic
    useEffect(() => {
        if (!isLoaded || !settings.membersOnly?.saleDate) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(settings.membersOnly.saleDate).getTime();
            const distance = target - now;

            if (distance < 0) {
                clearInterval(interval);
                window.location.href = "/";
            } else {
                setTimeLeft({
                    d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isLoaded, settings.membersOnly]);

    const formattedTime = `${timeLeft.d}D ${timeLeft.h.toString().padStart(2, '0')}:${timeLeft.m.toString().padStart(2, '0')}:${timeLeft.s.toString().padStart(2, '0')}`;


    // -------------------------------------------------------------------------
    // CUSTOM OTP HANDLERS (WORDPRESS ENDPOINTS)
    // -------------------------------------------------------------------------

    // 1. Send OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Call Custom WP Endpoint
            const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || '';
            const res = await fetch(`${baseUrl}/wp-json/drotes/v1/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            // Handle non-JSON responses (like 404 HTML pages) gracefully
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Non-JSON response:", text);
                throw new Error("Server Error: Endpoint not found or invalid response. Please check if the Snippet is active.");
            }

            if (res.ok && data.success) {
                setOtpSent(true);
            } else {
                throw new Error(data.message || data.code || "Failed to send code");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to send verification code.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Verify OTP & Auto-Register
    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setError("");

        try {
            const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || '';

            // A. Verify OTP via WP Endpoint
            const res = await fetch(`${baseUrl}/wp-json/drotes/v1/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, code: otpCode })
            });

            const verifyData = await res.json();

            if (!res.ok || !verifyData.success) {
                throw new Error(verifyData.message || "Invalid Code");
            }

            // B. If Verified, Register User via GraphQL
            console.log("OTP Verified! Registering...");
            const { data } = await register({ variables: { email, username, password } });

            if (data?.registerCustomer?.customer?.id) {
                // SUCCESS: Account Created
                const fakeToken = `access_${Date.now()}_${username}`;
                document.cookie = `auth_token=${fakeToken}; path=/; max-age=604800`; // 7 Days
                window.location.href = "/";
            } else {
                throw new Error("Verification successful, but Registration failed (User may exist).");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };


    // 3. Handle Rest Login (Standard)
    const performRestLogin = async (usr: string, pwd: string) => {
        setRestLoading(true);
        setRestError("");
        try {
            const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || '';
            const res = await fetch(`${baseUrl}/wp-json/jwt-auth/v1/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usr, password: pwd })
            });

            if (res.status === 404) {
                setRestError("Login Unavailable (System Offline).");
                setRestLoading(false);
                return;
            }

            const data = await res.json();
            if (res.ok && data.token) {
                document.cookie = `auth_token=${data.token}; path=/; max-age=86400`;
                window.location.href = "/";
            } else {
                setRestError(data.message || "Login failed");
            }
        } catch (err) {
            console.error(err);
            setRestError("Connection failed");
        } finally {
            setRestLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await performRestLogin(email, password);
    };

    if (!isLoaded) return <div className="min-h-screen bg-neutral-900" />;

    return (
        <main className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-neutral-900 text-white selection:bg-white selection:text-black">

            {/* BACKGROUND: Dark Gradient (Neutral 900 -> 700) */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-700" />

            {/* HEADER */}
            <header className="relative z-10 w-full p-8 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="w-32 h-12 relative"
                >
                    <Image
                        src={settings.logo.url}
                        alt="Logo"
                        fill
                        className="object-contain brightness-0 invert"
                    />
                </motion.div>
            </header>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl">
                        <Lock size={18} className="text-white/80" />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-6 font-mono">Members Access Only</p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white tabular-nums leading-none drop-shadow-2xl">{formattedTime}</h1>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mt-8 mb-8" />
                    <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                        The store is locked. Please login or verify your email to register.
                    </p>
                </motion.div>

                {/* 3. Action Buttons (Grid) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 flex flex-col md:flex-row items-center gap-4"
                >
                    <button
                        onClick={() => setShowAuth("register")}
                        className="group relative w-48 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <span className="relative z-10">Join The Club</span>
                        <div className="absolute inset-0 bg-neutral-200 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                    </button>

                    <button
                        onClick={() => setShowAuth("login")}
                        className="group relative w-48 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 hover:border-white"
                    >
                        <span className="relative z-10">Member Login</span>
                    </button>
                </motion.div>

                {/* Admin Bypass */}
                <button
                    onClick={() => {
                        const pwd = prompt("Enter Administration Password:");
                        if (pwd === "drotes2026") {
                            document.cookie = "members_access=true; path=/; max-age=3600";
                            window.location.href = "/";
                        }
                    }}
                    className="mt-8 text-[10px] font-mono text-white/10 hover:text-white/50 uppercase tracking-widest transition-colors"
                >
                    Admin Access
                </button>
            </div>

            {/* FOOTER - FIXED layout and Updated Left Content */}
            <div className="relative z-10 w-full p-8 flex justify-between items-end">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                    <span className="text-[10px] sm:text-xs text-neutral-300 font-mono font-bold tracking-widest uppercase typewrite-text">
                        Global HQ - MILAN
                    </span>
                </div>

                <motion.button
                    onClick={() => setShowInfo(true)}
                    className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all flex items-center justify-center backdrop-blur-sm border border-white/5"
                >
                    <Info size={18} />
                </motion.button>
            </div>

            {/* INFO MODAL */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                        onClick={() => setShowInfo(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 border border-white/10 text-white w-full max-w-md rounded-[32px] p-8 relative shadow-2xl"
                        >
                            <button onClick={() => setShowInfo(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={16} /></button>

                            <h3 className="text-lg font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={18} /> About Access
                            </h3>
                            <div className="space-y-4 text-xs leading-relaxed text-neutral-400 font-mono">
                                <p>
                                    Access to the store is currently restricted to registered members only.
                                    New collections are released periodically.
                                </p>
                                <p>
                                    If you are verifying your account, please check your email (including spam) for the verification link.
                                </p>
                                <div className="mt-6 pt-6 border-t border-white/10 text-[10px] text-neutral-600">
                                    SUPPORT: HELP@ANECDOTE.COM
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AUTH MODAL */}
            <AnimatePresence>
                {showAuth && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-neutral-900 border border-white/10 text-white w-full max-w-sm rounded-[32px] p-8 relative shadow-2xl">
                            <button onClick={() => { setShowAuth(null); setEmail(""); setPassword(""); setUsername(""); setOtpSent(false); setError(""); setRestError(""); }} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={16} /></button>

                            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                                {showAuth === "login" ? "Member Login" : "Join The Club"}
                            </h3>

                            {/* FORM CONTENT */}

                            {/* Case 1: OTP Sent - Show Code Input */}
                            {otpSent && showAuth === "register" ? (
                                <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                                    <div className="text-center mb-6">
                                        <Mail size={32} className="mx-auto text-white/50 mb-2" />
                                        <p className="text-sm text-neutral-300">Enter the 6-digit code sent to <strong className="text-white">{email}</strong></p>
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-3xl font-mono text-center tracking-[0.5em] focus:border-white focus:outline-none transition-colors"
                                            placeholder="000000"
                                            required
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {(error || restError || regError) && (
                                        <div className="text-red-500 text-xs font-mono bg-red-500/10 p-2 rounded-lg text-center">
                                            {(error || restError || regError?.message || "").replace(/<[^>]*>?/gm, '')}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isVerifying}
                                        className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-neutral-200 transition-colors mt-4 flex justify-center items-center gap-2"
                                    >
                                        {(isVerifying) && <Loader2 size={14} className="animate-spin" />}
                                        {isVerifying ? "Verifying..." : "Verify & Create"}
                                    </button>

                                    <div className="text-center mt-4">
                                        <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-neutral-500 hover:text-white underline">Change Details</button>
                                    </div>
                                </form>
                            ) : (
                                // Case 2: Initial Forms
                                <form onSubmit={showAuth === "login" ? handleLogin : handleSendOTP} className="space-y-4">
                                    {/* LOGIN FORM - Standard */}
                                    {showAuth === "login" && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Username </label>
                                                <input
                                                    type="text"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors"
                                                    placeholder="Enter username"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Password</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors"
                                                    placeholder="Enter password"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* REGISTER FORM - With OTP Trigger */}
                                    {showAuth === "register" && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors"
                                                    placeholder="you@example.com"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Choose Username</label>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors"
                                                    placeholder="Username"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">Choose Password</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors"
                                                    placeholder="Password"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Error / Status Message - Strip HTML tags */}
                                    {(error || restError || regError) && (
                                        <div className="text-red-500 text-xs font-mono bg-red-500/10 p-2 rounded-lg">
                                            {(error || restError || regError?.message || "").replace(/<[^>]*>?/gm, '')}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || restLoading || regLoading}
                                        className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-neutral-200 transition-colors mt-4 flex justify-center items-center gap-2"
                                    >
                                        {(loading || restLoading || regLoading) && <Loader2 size={14} className="animate-spin" />}
                                        {showAuth === "login" ? "Unlock Access" : "Send Verification Code"}
                                    </button>
                                </form>
                            )}

                            {(!otpSent) && (
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => setShowAuth(showAuth === "login" ? "register" : "login")}
                                        className="text-xs text-neutral-500 hover:text-white transition-colors underline decoration-neutral-700 underline-offset-4"
                                    >
                                        {showAuth === "login" ? "New here? Create an account" : "Already a member? Login"}
                                    </button>
                                </div>
                            )}

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Noise Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            <TypewriteStyle />
        </main>
    );
}

// Add CSS for typewrite effect if not global
function TypewriteStyle() {
    return (
        <style jsx global>{`
            .typewrite-text {
                overflow: hidden;
                white-space: nowrap;
                border-right: 2px solid rgba(255,255,255,0.5);
                animation: typing 3.5s steps(30, end), blink-caret 0.75s step-end infinite;
            }
            @keyframes typing {
                from { width: 0 }
                to { width: 100% }
            }
            @keyframes blink-caret {
                from, to { border-color: transparent }
                50% { border-color: rgba(255,255,255,0.5) }
            }
        `}</style>
    );
}

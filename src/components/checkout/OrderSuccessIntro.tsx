"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderSuccessIntro({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);

    // Sequence controller
    useEffect(() => {
        const t1 = setTimeout(() => setStep(1), 500); // Start checkmark
        const t2 = setTimeout(() => setStep(2), 2000); // Show text
        const t3 = setTimeout(() => {
            onComplete();
        }, 4000); // Exit

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
            className="fixed inset-0 z-[1000] bg-black text-white flex flex-col items-center justify-center"
        >
            <div className="relative">
                {/* Checkmark Circle */}
                <motion.svg
                    width="120"
                    height="120"
                    viewBox="0 0 100 100"
                    className="stroke-white stroke-[1px] fill-transparent"
                >
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        initial={{ pathLength: 0 }}
                        animate={step >= 1 ? { pathLength: 1 } : {}}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                    <motion.path
                        d="M30 50 L45 65 L70 35"
                        initial={{ pathLength: 0 }}
                        animate={step >= 1 ? { pathLength: 1 } : {}}
                        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                    />
                </motion.svg>
            </div>

            <motion.div className="mt-8 overflow-hidden h-12">
                <motion.h1
                    initial={{ y: "100%" }}
                    animate={step >= 2 ? { y: "0%" } : {}}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="text-2xl font-bold uppercase tracking-[0.3em]"
                >
                    Order Secured
                </motion.h1>
            </motion.div>
        </motion.div>
    );
}

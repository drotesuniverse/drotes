"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContrastSectionProps {
    theme?: "light" | "dark";
    children: React.ReactNode;
    className?: string;
}

export default function ContrastSection({ theme = "light", children, className }: ContrastSectionProps) {
    return (
        <section
            className={cn(
                "min-h-screen flex flex-col justify-center px-6 md:px-24 py-24 transition-colors duration-700 ease-in-out",
                theme === "dark" ? "bg-black text-white" : "bg-white text-black",
                className
            )}
        >
            <div className="max-w-[90vw] mx-auto">
                {children}
            </div>
        </section>
    );
}

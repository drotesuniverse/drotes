import { MotionValue, motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const fontSize = 30;
const padding = 15;
const height = fontSize + padding;

export default function LiveCounter({ value, className = "" }: { value: number, className?: string }) {
    return (
        <div style={{ fontSize }} className={`flex overflow-hidden leading-none ${className}`}>
            <Digit place={1000} value={value} />
            <Digit place={100} value={value} />
            <Digit place={10} value={value} />
            <Digit place={1} value={value} />
        </div>
    );
}

function Digit({ place, value }: { place: number; value: number }) {
    let valueRoundedToPlace = Math.floor(value / place);
    let animatedValue = useSpring(valueRoundedToPlace);

    useEffect(() => {
        animatedValue.set(valueRoundedToPlace);
    }, [animatedValue, valueRoundedToPlace]);

    return (
        <div className="relative w-[1ch] tabular-nums h-[1em]">
            <motion.div style={{
                y: useTransform(animatedValue, (latest) => {
                    const height = 1; // 1em
                    const placeValue = latest % 10;
                    const offset = (10 + placeValue) % 10;
                    let memo = offset * height;
                    if (offset > 5) {
                        memo -= 10 * height;
                    }
                    return -memo * 100 + "%"; // Using percentage for standard height
                })
            }} className="absolute inset-0 flex flex-col items-center">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-[1em] flex items-center justify-center">
                        {i}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

// Simpler Version for non-scrolling, just smooth count up
export function SmoothCounter({ value, className }: { value: number; className?: string }) {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span className={className}>{display}</motion.span>;
}

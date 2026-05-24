"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollAnimationProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fade-in-up" | "fade-in" | "slide-in-right" | "scale-up" | "fade-in-left";
    delay?: number; // in ms or seconds
    duration?: number;
    threshold?: number;
}

export function ScrollAnimation({
    children,
    className,
    animation = "fade-in-up",
    delay = 0,
    duration = 0.6,
}: ScrollAnimationProps) {
    // Gracefully handle delays passed as either seconds or milliseconds
    const delaySec = delay >= 10 ? delay / 1000 : delay;

    const variants = {
        "fade-in-up": {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
        },
        "fade-in": {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
        "slide-in-right": {
            hidden: { opacity: 0, x: 50 },
            visible: { opacity: 1, x: 0 },
        },
        "fade-in-left": {
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
        },
        "scale-up": {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={variants[animation]}
            transition={{
                duration: duration,
                delay: delaySec,
                ease: [0.16, 1, 0.3, 1], // Ultra-premium ease-out cubic curve
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

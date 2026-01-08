"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollAnimationProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fade-in-up" | "fade-in" | "slide-in-right" | "scale-up";
    delay?: number; // in ms
    threshold?: number; // 0 to 1
}

export function ScrollAnimation({
    children,
    className,
    animation = "fade-in-up",
    delay = 0,
    threshold = 0.1,
}: ScrollAnimationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold,
                rootMargin: "0px 0px -50px 0px", // Trigger a bit before it enters
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [delay, threshold]);

    const animationClass = {
        "fade-in-up": "animate-fade-in-up",
        "fade-in": "animate-fade-in",
        "slide-in-right": "animate-slide-in-right",
        "scale-up": "animate-scale-up",
    }[animation];

    return (
        <div
            ref={ref}
            className={cn(
                "transition-all duration-700 ease-out",
                isVisible ? `${animationClass} opacity-100` : "opacity-0 translate-y-4",
                className
            )}
        >
            {children}
        </div>
    );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
    deadline: Date;
    onExpire: () => void;
    className?: string;
}

export function CountdownTimer({ deadline, onExpire, className }: CountdownTimerProps) {
    const [remainingMs, setRemainingMs] = useState(() => deadline.getTime() - Date.now());
    const expiredRef = useRef(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = deadline.getTime() - Date.now();
            setRemainingMs(remaining);
            if (remaining <= 0 && !expiredRef.current) {
                expiredRef.current = true;
                clearInterval(interval);
                onExpire();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [deadline, onExpire]);

    const clamped = Math.max(0, remainingMs);
    const totalSeconds = Math.floor(clamped / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    // Last 3 minutes: blink red so the student knows to finish.
    const isLow = totalSeconds <= 3 * 60;
    const isNear = totalSeconds <= 5 * 60;

    const label = hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`;

    return (
        <div
            role="timer"
            aria-label={`Time left ${label}`}
            className={cn(
                "flex items-center gap-2 px-4 py-2.5 font-black text-base tabular-nums border-l-4",
                isLow ? "bg-red-700 text-white border-red-300 animate-[pulse_0.9s_ease-in-out_infinite]"
                    : isNear ? "bg-[#0B1F3A] text-amber-300 border-amber-400"
                    : "bg-[#0B1F3A] text-white border-[#C8A96A]",
                className
            )}
        >
            <Clock className={cn("w-4 h-4", isLow ? "text-white" : "text-[#C8A96A]")} />
            {label}
        </div>
    );
}

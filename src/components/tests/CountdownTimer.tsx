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
    const isLow = totalSeconds <= 60;

    const label = hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm tabular-nums",
            isLow ? "bg-red-100 text-red-700 animate-pulse" : "bg-indigo-100 text-indigo-700",
            className
        )}>
            <Clock className="w-4 h-4" />
            {label}
        </div>
    );
}

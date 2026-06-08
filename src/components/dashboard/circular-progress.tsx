
"use client";

import React from "react";

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
}

export function CircularProgress({ value, size = 160, strokeWidth = 12, label = "OVERALL" }: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background Circle */}
                <circle
                    className="text-[#0B1F3A]/10"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <circle
                    className="text-[#C8A96A] transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-serif text-[#0B1F3A]">{value}%</span>
                {label && <span className="text-[9px] font-black tracking-[0.3em] text-[#0B1F3A]/40 uppercase mt-1">{label}</span>}
            </div>
        </div>
    );
}

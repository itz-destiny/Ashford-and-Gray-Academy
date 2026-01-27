
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
                    className="text-slate-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <circle
                    className="text-indigo-600 transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-slate-900">{value}%</span>
                {label && <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</span>}
            </div>
        </div>
    );
}

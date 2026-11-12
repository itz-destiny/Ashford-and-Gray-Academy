"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Props {
    title: string;
    score: number;
    maxScore: number;
    submitReason?: 'student' | 'time_up' | 'violations';
    pendingMarking?: boolean;
}

function verdict(pct: number) {
    if (pct >= 90) return { word: "Outstanding!", line: "Top marks. That is real mastery." };
    if (pct >= 70) return { word: "Excellent!", line: "A strong result. Well done." };
    if (pct >= 50) return { word: "Well done!", line: "You passed. Keep building on it." };
    if (pct >= 30) return { word: "Good effort", line: "You're on your way. Review and try again." };
    return { word: "Keep going", line: "Every expert started here. Review the topics and come back stronger." };
}

const CONFETTI_COLORS = ["#C8A96A", "#0B1F3A", "#1F7A5A", "#E8D5A8", "#F2C14E"];

/** The score reveal shown after an exam taken from an exam link. */
export function ExamResult({ title, score, maxScore, submitReason, pendingMarking }: Props) {
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const [shown, setShown] = useState(0);
    const [ring, setRing] = useState(0);
    const v = verdict(pct);
    const celebrate = pct >= 50 && !pendingMarking;

    // Count the score up and fill the ring.
    useEffect(() => {
        const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduce) { setShown(score); setRing(pct); return; }
        const duration = 1400;
        const start = performance.now();
        let raf = 0;
        const tick = (t: number) => {
            const k = Math.min(1, (t - start) / duration);
            const ease = 1 - Math.pow(1 - k, 3);
            setShown(Math.round(score * ease));
            setRing(pct * ease);
            if (k < 1) raf = requestAnimationFrame(tick);
        };
        const delay = setTimeout(() => { raf = requestAnimationFrame(tick); }, 350);
        return () => { clearTimeout(delay); cancelAnimationFrame(raf); };
    }, [score, pct]);

    const R = 88;
    const C = 2 * Math.PI * R;
    return (
        <div className="relative overflow-hidden min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
            {celebrate && (
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    {Array.from({ length: 36 }).map((_, i) => (
                        <span
                            key={i}
                            className="absolute top-0 block w-2 h-3 opacity-0 motion-safe:animate-[agfa-fall_2.8s_ease-in_forwards]"
                            style={{
                                left: `${(i * 37) % 100}%`,
                                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                                animationDelay: `${0.4 + (i % 12) * 0.12}s`,
                                transform: `rotate(${(i * 47) % 360}deg)`,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="relative w-full max-w-md bg-white border-t-4 border-[#C8A96A] shadow-xl px-6 py-10 sm:px-10 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-500">
                <div className="relative h-12 w-48 mx-auto mb-5">
                    <Image src="/A & G1.png" alt="Ashford & Gray Fusion Academy" fill sizes="192px" className="object-contain" priority />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Your result</p>
                <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-[#0B1F3A]">{pendingMarking ? "Submitted" : v.word}</h1>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{title}</p>

                <div className="relative mx-auto mt-8 w-52 h-52 max-w-full">
                    <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden>
                        <circle cx="100" cy="100" r={R} fill="none" stroke="#0B1F3A" strokeOpacity="0.08" strokeWidth="14" />
                        <circle
                            cx="100" cy="100" r={R} fill="none"
                            stroke={pct >= 50 ? "#C8A96A" : "#0B1F3A"}
                            strokeWidth="14" strokeLinecap="butt"
                            strokeDasharray={C}
                            strokeDashoffset={C * (1 - ring / 100)}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="font-serif text-6xl leading-none text-[#0B1F3A] tabular-nums">{Math.round(ring)}<span className="text-3xl align-top">%</span></p>
                        <p className="mt-2 text-sm font-bold text-slate-500 tabular-nums">{shown} out of {maxScore}</p>
                    </div>
                </div>

            </div>

            <style>{`@keyframes agfa-fall { 0% { opacity: 1; transform: translateY(-20px) rotate(0deg); } 100% { opacity: 0; transform: translateY(105vh) rotate(540deg); } }`}</style>
        </div>
    );
}

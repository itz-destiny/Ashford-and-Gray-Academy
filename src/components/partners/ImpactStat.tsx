"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ImpactStatProps {
    value: number;
    label: string;
    delay?: number;
}

export function ImpactStat({ value, label, delay = 0 }: ImpactStatProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const duration = 1400;
        let frame: number;
        const start = performance.now() + delay * 1000;

        const tick = (now: number) => {
            const elapsed = now - start;
            if (elapsed < 0) {
                frame = requestAnimationFrame(tick);
                return;
            }
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [inView, value, delay]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
            className="text-center bg-white border-t-4 border-t-[#C8A96A] shadow-sm py-10 px-4"
        >
            <p className="text-4xl lg:text-5xl font-serif font-black text-[#0B1F3A] tabular-nums">{display}</p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-relaxed">
                {label}
            </p>
        </motion.div>
    );
}

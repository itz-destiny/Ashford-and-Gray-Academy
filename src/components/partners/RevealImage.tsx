"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function RevealImage() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <div ref={ref} className="relative overflow-hidden w-full">
            {/* Gold curtain that pulls upward */}
            <motion.div
                className="absolute inset-0 bg-[#C8A96A] z-10 origin-top"
                initial={{ scaleY: 1 }}
                animate={inView ? { scaleY: 0 } : { scaleY: 1 }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
                style={{ transformOrigin: "top" }}
            />
            {/* Navy backing visible briefly behind curtain */}
            <motion.div
                className="absolute inset-0 bg-[#0B1F3A] z-[9]"
                initial={{ opacity: 1 }}
                animate={inView ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.0 }}
            />
            {/* The image itself scales gently into place */}
            <motion.div
                className="relative w-full max-w-xl mx-auto aspect-[3/4]"
                initial={{ scale: 1.08 }}
                animate={inView ? { scale: 1 } : { scale: 1.08 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
                <Image
                    src="/partners/impact-2.png"
                    alt="Miss Soye Karibi George — Miss World Nigeria 2026"
                    fill
                    sizes="100vw"
                    className="object-cover object-top"
                    priority={false}
                />
                {/* Overlay gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 via-[#0B1F3A]/10 to-transparent" />
                {/* Caption */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 p-8 lg:p-14"
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-1">
                        Miss World Nigeria
                    </p>
                    <p className="text-white font-serif text-2xl lg:text-4xl font-bold leading-tight">
                        Miss Soye Karibi George
                    </p>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                        2026 · Representing Nigeria
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Facilitator } from "@/lib/facilitators-data";
import { ProfileDialog } from "@/app/(public)/facilitators/profile-dialog";

function initials(name: string) {
    return name
        .replace(/^(Dr\.|Barrister|Comrade)\s+/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
}

export function FacilitatorCard({ facilitator, index = 0 }: { facilitator: Facilitator; index?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.1 }}
            className="group relative aspect-[3/4] overflow-hidden bg-[#0B1F3A] shadow-md"
        >
            {facilitator.photo ? (
                <Image
                    src={facilitator.photo}
                    alt={facilitator.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0B1F3A] to-[#132C4F]">
                    <span className="text-5xl font-serif font-bold text-[#C8A96A]/70">{initials(facilitator.name)}</span>
                </div>
            )}

            {/* Base gradient for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/10 to-transparent" />

            {/* Gold top hairline that grows on hover */}
            <div className="absolute top-0 left-0 h-[3px] w-0 bg-[#C8A96A] transition-all duration-500 ease-out group-hover:w-full" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-1.5 line-clamp-1">
                    {facilitator.title}
                </p>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight">
                    {facilitator.name}
                </h3>
                {facilitator.postNominals && (
                    <p className="text-[10px] text-white/50 italic mt-1 line-clamp-1">{facilitator.postNominals}</p>
                )}

                <div className="mt-3 opacity-100 max-h-12 md:opacity-0 md:max-h-0 overflow-hidden transition-all duration-500 ease-out md:group-hover:max-h-12 md:group-hover:opacity-100">
                    <ProfileDialog facilitator={facilitator} variant="onDark" />
                </div>
            </div>
        </motion.div>
    );
}

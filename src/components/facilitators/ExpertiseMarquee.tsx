const DEFAULT_ITEMS = [
    "Protocol Management",
    "Finance & Economics",
    "Brand Management",
    "Leadership Development",
    "Communications",
    "Hospitality Standards",
    "Events Management",
    "Digital Business",
    "Labour Relations",
    "Guest Experience",
];

export function ExpertiseMarquee({ items = DEFAULT_ITEMS }: { items?: string[] }) {
    const track = [...items, ...items];

    return (
        <div className="relative w-full overflow-hidden border-y border-white/10 bg-[#0B1F3A] py-5">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0B1F3A] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0B1F3A] to-transparent z-10" />
            <div className="flex w-max animate-marquee">
                {track.map((item, i) => (
                    <div key={i} className="flex items-center shrink-0">
                        <span className="px-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 whitespace-nowrap">
                            {item}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]" />
                    </div>
                ))}
            </div>
        </div>
    );
}

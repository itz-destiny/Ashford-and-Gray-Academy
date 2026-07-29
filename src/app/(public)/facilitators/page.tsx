import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FACILITATORS } from "@/lib/facilitators-data";
import { FacilitatorCard } from "@/components/facilitators/FacilitatorCard";
import { ExpertiseMarquee } from "@/components/facilitators/ExpertiseMarquee";
import { Reveal } from "@/components/facilitators/Reveal";
import { Quote } from "lucide-react";

export const metadata = {
    title: "Meet Our Facilitators — Ashford & Gray Fusion Academy",
    description: "Learn from professionals who have led, served and delivered — the accomplished executives, consultants, and industry leaders who facilitate at Ashford & Gray Fusion Academy.",
    alternates: { canonical: "https://www.ashfordandgrayfusionacademy.com/facilitators" },
    openGraph: {
        title: "Meet Our Facilitators — Ashford & Gray Fusion Academy",
        description: "Learn from professionals who have led, served and delivered.",
        url: "https://www.ashfordandgrayfusionacademy.com/facilitators",
    },
};

const INTRO_PARAGRAPHS = [
    "Our facilitators are not simply instructors—they are accomplished professionals, executives, consultants, entrepreneurs, and industry leaders who have spent decades building careers, leading organizations, solving real-world challenges, and shaping the future of their respective fields.",
    "Every lecture, discussion, case study, and practical exercise is enriched by firsthand experience gained from boardrooms, corporate organizations, hospitality establishments, government institutions, international projects, and executive leadership roles.",
    "This commitment ensures that our students receive more than theoretical knowledge. They gain practical insights, proven strategies, professional standards, and industry perspectives that can be applied immediately in the workplace.",
    "Our faculty represents a diverse blend of expertise across hospitality management, executive operations, leadership development, business innovation, finance, human resource management, labour relations, communications, branding, protocol management, restaurant operations, entrepreneurship, customer experience, and organizational excellence.",
    "United by a shared passion for excellence and lifelong learning, each facilitator is carefully selected not only for professional achievement but also for integrity, commitment to mentoring others, and the ability to inspire meaningful transformation.",
    "Whether you are an aspiring professional, an experienced executive, a business owner, or an organization seeking to develop your workforce, you can be confident that you are learning from individuals who have successfully navigated the very challenges they teach.",
];

export default function FacilitatorsPage() {
    return (
        <div className="bg-[#FAF9F6]">
            {/* ── HERO ─────────────────────────────────── */}
            <header className="relative overflow-hidden bg-[#0B1F3A]">
                {/* Decorative glows */}
                <div className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#C8A96A]/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -left-24 w-[24rem] h-[24rem] rounded-full bg-[#1F7A5A]/20 blur-3xl" />

                <div className="container relative px-6 lg:px-12 py-24 md:py-32">
                    <Reveal className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-[1px] bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">The People Behind the Programme</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.05]">
                            Meet Our Facilitators
                        </h1>
                        <p className="text-lg md:text-xl font-serif italic text-[#C8A96A] mt-6 max-w-2xl">
                            Learn from Professionals Who Have Led, Served and Delivered
                        </p>
                    </Reveal>
                </div>

                <ExpertiseMarquee />
            </header>

            {/* ── MANIFESTO / INTRO ────────────────────── */}
            <section className="container px-6 lg:px-12 py-20 md:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 max-w-5xl mx-auto items-start">
                    <Reveal className="hidden lg:block">
                        <Quote className="w-16 h-16 text-[#C8A96A]/30" />
                    </Reveal>
                    <div>
                        <Reveal>
                            <p className="text-2xl md:text-3xl font-serif text-[#0B1F3A] leading-snug max-w-3xl">
                                At Ashford &amp; Gray Fusion Academy, we believe that exceptional education is best delivered by exceptional practitioners.
                            </p>
                        </Reveal>

                        <div className="mt-8 space-y-5 text-base md:text-lg text-slate-600 leading-relaxed font-medium max-w-3xl">
                            {INTRO_PARAGRAPHS.map((p, i) => (
                                <Reveal key={i} delay={Math.min(i * 0.05, 0.3)}>
                                    <p>{p}</p>
                                </Reveal>
                            ))}
                        </div>

                        <Reveal delay={0.2} className="mt-10 pt-6 border-t border-[#0B1F3A]/10 max-w-3xl">
                            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                At AGFA, education goes beyond the classroom. It is a transfer of experience, wisdom, professional discipline, and practical excellence. We invite you to meet the distinguished professionals who make this learning experience possible.
                            </p>
                            <div className="mt-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                                <p className="text-sm italic text-slate-400 mt-1">Mastering Luxury. Elevating Business.</p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── FACILITATOR GRID ──────────────────────── */}
            <section className="bg-white border-y border-slate-100">
                <div className="container px-6 lg:px-12 py-20 md:py-28">
                    <Reveal className="text-center max-w-2xl mx-auto mb-14">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-8 h-px bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Our Facilitators</span>
                            <div className="w-8 h-px bg-[#C8A96A]" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif text-[#0B1F3A] tracking-tight">
                            Distinguished Practitioners, Not Just Instructors
                        </h2>
                    </Reveal>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {FACILITATORS.map((facilitator, i) => (
                            <FacilitatorCard key={facilitator.slug} facilitator={facilitator} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────── */}
            <Reveal>
                <section className="bg-[#0B1F3A] relative overflow-hidden">
                    <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] rounded-full bg-[#C8A96A]/10 blur-3xl" />
                    <div className="container relative px-6 lg:px-12 py-24 md:py-32 text-center">
                        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight mb-10 max-w-2xl mx-auto leading-tight">
                            Learn directly from those who have led, served, and delivered.
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild className="h-14 px-10 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.4em] rounded-none shadow-none border-none">
                                <Link href="/login?view=signup">Apply for Admission</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-14 px-10 border-white/20 text-white hover:bg-white/10 rounded-none font-black text-[10px] uppercase tracking-[0.4em]">
                                <Link href="/contact">Contact the Registry</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </Reveal>
        </div>
    );
}

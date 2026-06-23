import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Users, Quote } from "lucide-react";

export const metadata = {
    title: "Partnership & Impact — Ashford & Gray Fusion Academy",
    description: "Transforming lives through partnership. Meet the sponsors, partners, and philanthropists whose generosity opens doors and shapes futures.",
};

const PARTNERS = [
    {
        id: "partner-1",
        image: "/partners/partner-1.png",
        alt: "Hon. Allison Anderson Igbiks — Esteemed Partner",
        name: "Hon. Allison Anderson Igbiks",
        title: "Member, Okrika/Ogu-Bolo Federal Constituency",
        body: "House of Representatives",
    },
    {
        id: "partner-2",
        image: "/partners/partner-2.png",
        alt: "Hon Linda Somiari-Stewart DSSRS — Esteemed Partner",
        name: "Amaopuerembo Hon Linda Somiari-Stewart DSSRS",
        title: "Deputy Leader, RSHA · Member Representing Okrika Constituency",
        body: "Rivers State House of Assembly",
    },
];

export default function PartnersPage() {
    return (
        <div className="bg-[#FAF9F6] min-h-screen">

            {/* ── PAGE HEADER ──────────────────────────────── */}
            <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A]">
                <div className="container mx-auto px-6 lg:px-20 py-20 lg:py-28">
                    <div className="max-w-3xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-[#C8A96A]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A]/70">
                                Ashford &amp; Gray Fusion Academy
                            </span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-serif text-white leading-tight tracking-tight">
                            Partnership<br />
                            <span className="text-[#C8A96A]">&amp; Impact.</span>
                        </h1>
                        <p className="text-lg font-serif italic text-white/60 leading-relaxed max-w-xl">
                            Transforming Lives Through Partnership
                        </p>
                    </div>
                </div>
            </div>

            {/* ── MAIN WRITE-UP ────────────────────────────── */}
            <div className="bg-white border-b border-[#0B1F3A]/10">
                <div className="container mx-auto px-6 lg:px-20 py-16 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2px_1fr] gap-12 lg:gap-16 items-start">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Heart className="w-4 h-4 text-[#C8A96A]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">Our Commitment</span>
                            </div>
                            <p className="text-base font-serif text-slate-600 leading-relaxed">
                                At Ashford and Gray Fusion Academy, we believe that talent is universal, but opportunity is not. Across communities, there are gifted, passionate, and determined individuals whose dreams often remain unrealized simply because they lack access to the right opportunities.
                            </p>
                            <p className="text-base font-serif text-slate-600 leading-relaxed">
                                This is why we are profoundly grateful to our esteemed sponsors, partners, philanthropists, and supporters whose generosity continues to open doors, restore hope, and transform lives.
                            </p>
                            <p className="text-base font-serif text-slate-600 leading-relaxed">
                                Every sponsorship represents more than a financial commitment; it is an investment in people, a belief in potential, and a deliberate contribution towards building a future defined by excellence, dignity, innovation, and service.
                            </p>
                        </div>
                        <div className="hidden lg:block bg-[#C8A96A]/20 self-stretch" />
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Star className="w-4 h-4 text-[#C8A96A]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">The Mission</span>
                            </div>
                            <p className="text-base font-serif text-slate-600 leading-relaxed">
                                Through these partnerships, aspiring hospitality professionals, domestic service practitioners, young graduates, entrepreneurs, and emerging leaders are equipped with the knowledge, skills, and confidence required to thrive in today&apos;s dynamic world.
                            </p>
                            <p className="text-base font-serif text-slate-600 leading-relaxed">
                                This page stands as a testament to the remarkable individuals and organizations who have chosen to become catalysts for change. It celebrates not only their generosity but also the achievements of the beneficiaries whose journeys have been made possible through their support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-20 py-16 lg:py-24 space-y-24">

                {/* ── OUR PARTNERS ─────────────────────────── */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4 border-b border-[#0B1F3A]/10 pb-6">
                        <Users className="w-5 h-5 text-[#C8A96A]" />
                        <h2 className="text-sm font-black text-[#0B1F3A] uppercase tracking-[0.3em]">
                            Our Partners &amp; Sponsors
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl">
                        {PARTNERS.map((p) => (
                            <div key={p.id} className="group border border-[#0B1F3A]/10 bg-white overflow-hidden border-t-4 border-t-[#C8A96A] shadow-sm">
                                <div className="relative aspect-[4/5] overflow-hidden bg-[#0B1F3A]">
                                    <Image
                                        src={p.image}
                                        alt={p.alt}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 50vw"
                                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6 border-t border-[#0B1F3A]/8 space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">
                                        Esteemed Partner
                                    </p>
                                    <p className="text-sm font-serif font-bold text-[#0B1F3A] leading-snug mt-2">
                                        {p.name}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                        {p.title}
                                    </p>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        {p.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border border-[#C8A96A]/20 bg-[#0B1F3A] p-10 lg:p-14 max-w-3xl border-l-4 border-l-[#C8A96A]">
                        <p className="text-base font-serif italic text-white/80 leading-relaxed">
                            &ldquo;To our sponsors and partners, thank you for believing in our vision.&rdquo;
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            <div className="w-8 h-px bg-[#C8A96A]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Myne Wilfred — Founder/President</span>
                        </div>
                    </div>
                </section>

                {/* ── IMPACT ───────────────────────────────── */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-[#0B1F3A]/10 pb-6">
                        <Star className="w-5 h-5 text-[#C8A96A]" />
                        <h2 className="text-sm font-black text-[#0B1F3A] uppercase tracking-[0.3em]">
                            Impact &amp; Achievements
                        </h2>
                    </div>

                    {/* ── FEATURE: Miss World Nigeria 2026 ─── */}
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6 lg:p-10 mb-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-2">Featured Impact Story</p>
                        <h3 className="text-2xl lg:text-3xl font-serif text-white leading-tight">
                            Congratulatory Message on the Emergence of<br />
                            <span className="text-[#C8A96A]">Miss Soye Karibi George as Miss World Nigeria</span>
                        </h3>
                    </div>

                    {/* ── Card 1: Coined youth message + impact-1 ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] bg-white border border-[#0B1F3A]/10 shadow-sm overflow-hidden">
                        <div className="relative min-h-[420px] lg:min-h-0 bg-[#0B1F3A]">
                            <Image
                                src="/partners/impact-1.png"
                                alt="Miss Soye Karibi George — Miss World Nigeria 2026"
                                fill
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Miss World Nigeria</p>
                                <p className="text-white font-serif font-bold text-base leading-snug">Miss Soye Karibi George</p>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">2026</p>
                            </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-5 border-l border-[#0B1F3A]/8">
                            <div className="flex items-center gap-3">
                                <Quote className="w-5 h-5 text-[#C8A96A] flex-shrink-0" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">A Message to Miss Soye</span>
                            </div>
                            <p className="text-[13px] font-serif text-[#0B1F3A] font-bold leading-snug">
                                To Miss Soye Karibi George — Miss World Nigeria 2026
                            </p>
                            <div className="space-y-3 text-[13px] font-serif text-slate-600 leading-relaxed">
                                <p>You are more than a crown. You are a declaration.</p>
                                <p>In a generation often defined by noise and distraction, you have chosen the path of purpose — rising through discipline, beauty, and grace to claim your place on one of the world&apos;s most celebrated stages.</p>
                                <p>Your emergence as Miss World Nigeria 2026 is a reminder to every young person that excellence is not an accident. It is the product of quiet preparation, courageous determination, and an unwavering belief in one&apos;s potential.</p>
                                <p>As you carry the green-white-green flag to Vietnam and onto the global stage, know that an entire nation — and the Ashford and Gray Fusion Academy community — rises with you.</p>
                                <p>We celebrate young people who are not content to simply exist in the world but are determined to shape it. You are that young person. Your crown is not the destination; it is the beginning.</p>
                                <p>Go forth with wisdom, speak with authority, serve with grace, and let the world see what Nigeria&apos;s finest are truly made of.</p>
                                <p className="font-bold text-[#0B1F3A]">Congratulations, Miss Soye. The world is yours to inspire.</p>
                            </div>
                            <div className="pt-2 border-t border-[#0B1F3A]/8">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 italic font-serif">Mastering Luxury, Elevating Business.</p>
                            </div>
                        </div>
                    </div>

                </section>

                {/* ── CLOSING STATEMENT ────────────────────── */}
                <section className="border border-[#0B1F3A]/10 bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-12 lg:p-20 text-center space-y-8">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <p className="text-lg lg:text-xl font-serif text-white/80 leading-relaxed">
                            Together, we are not merely educating individuals; we are shaping futures, empowering communities, and building a legacy of impact.
                        </p>
                        <div className="w-16 h-px bg-[#C8A96A] mx-auto" />
                        <p className="text-base font-serif italic text-[#C8A96A]">
                            Mastering Luxury, Elevating Business.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-3 bg-[#C8A96A] hover:bg-white text-[#0B1F3A] px-10 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300"
                        >
                            Become a Partner
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}

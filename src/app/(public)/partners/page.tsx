import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Users } from "lucide-react";

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

const IMPACT = [
    {
        id: "impact-1",
        image: "/partners/impact-1.png",
        alt: "Miss World Nigeria 2026 — Academy Impact",
        caption: "Miss World Nigeria 2026",
    },
    {
        id: "impact-2",
        image: "/partners/impact-2.png",
        alt: "Miss World Nigeria 2026 — Academy Impact",
        caption: "Miss World Nigeria 2026",
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

                        {/* Left column */}
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

                        {/* Divider */}
                        <div className="hidden lg:block bg-[#C8A96A]/20 self-stretch" />

                        {/* Right column */}
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

                    {/* Gratitude message */}
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
                <section className="space-y-12">
                    <div className="flex items-center gap-4 border-b border-[#0B1F3A]/10 pb-6">
                        <Star className="w-5 h-5 text-[#C8A96A]" />
                        <h2 className="text-sm font-black text-[#0B1F3A] uppercase tracking-[0.3em]">
                            Impact &amp; Achievements
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {IMPACT.map((item) => (
                            <div key={item.id} className="group border border-[#0B1F3A]/10 bg-white overflow-hidden border-t-4 border-t-[#0B1F3A] shadow-sm">
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#0B1F3A]">
                                    <Image
                                        src={item.image}
                                        alt={item.alt}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 50vw"
                                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6 border-t border-[#0B1F3A]/8">
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">
                                        Impact Story
                                    </p>
                                    <p className="text-sm font-serif font-bold text-[#0B1F3A] mt-1">{item.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Beneficiary message */}
                    <div className="border border-[#0B1F3A]/10 bg-white p-10 lg:p-14 border-l-4 border-l-[#1F7A5A]">
                        <p className="text-base font-serif text-slate-600 leading-relaxed max-w-2xl">
                            To our beneficiaries, may this opportunity inspire you to pursue excellence, serve with distinction, and become a source of transformation in the lives of others.
                        </p>
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

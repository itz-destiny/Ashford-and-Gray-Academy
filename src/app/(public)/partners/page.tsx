import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Users, Quote } from "lucide-react";
import { Reveal } from "@/components/partners/Reveal";
import { ImpactStat } from "@/components/partners/ImpactStat";

export const metadata = {
    title: "Impact & Partners — Ashford & Gray Fusion Academy",
    description: "Transforming lives through partnership. Meet the sponsors, partners, and philanthropists whose generosity opens doors and shapes futures.",
};

const PARTNERS = [
    {
        id: "linda-somiari-stewart",
        image: "/partners/partner-2.png",
        alt: "Hon Linda Somiari-Stewart DSSRS — Esteemed Partner",
        name: "Amaopuerembo Hon Linda Somiari-Stewart DSSRS",
        title: "Deputy Leader, RSHA · Member Representing Okrika Constituency",
        body: "Rivers State House of Assembly",
        beneficiaries: 10,
    },
    {
        id: "anderson-allison-igbiks",
        image: "/partners/partner-1.png",
        alt: "Hon. Allison Anderson Igbiks — Esteemed Partner",
        name: "Hon. Allison Anderson Igbiks",
        title: "Member, Okrika/Ogu-Bolo Federal Constituency",
        body: "House of Representatives",
        beneficiaries: 30,
    },
];

const IMPACT_STATS = [
    { value: 258, label: "Total Sponsored Beneficiaries" },
    { value: 4, label: "Confirmed Impact Partners" },
    { value: 23, label: "Local Government Areas Covered" },
];

const IMPACT_PARTNERS = [
    {
        id: "founder-summary",
        name: "Founder's Commitment",
        title: "Myne Wilfred · Founder & President",
        beneficiaries: 10,
        quote: "Leading by example through a personal investment in human capital development.",
        href: "#founders-commitment",
    },
    {
        id: "cecilia-summary",
        name: "Cecilia Iniperitiari Dikibo",
        title: "Vice President & Director of Brand Strategy",
        beneficiaries: 8,
        quote: "Investing in people, in potential, and in the future of our communities.",
        href: "#cecilia-dikibo",
    },
    {
        id: "linda-summary",
        name: "Hon. Linda Somiari Stewart",
        title: "Member, Rivers State House of Assembly",
        beneficiaries: 10,
        quote: "Supporting educational empowerment in Okrika.",
        href: "#linda-somiari-stewart",
    },
    {
        id: "anderson-summary",
        name: "Hon. Anderson Allison Igbiks",
        title: "Member, House of Representatives",
        beneficiaries: 30,
        quote: "Investing in leadership and professional development.",
        href: "#anderson-allison-igbiks",
    },
    {
        id: "dimkpa-summary",
        name: "Chukwudi Dimkpa Foundation",
        title: "Human Capital Development Initiative",
        beneficiaries: 200,
        quote: "Empowering people across the 23 Local Government Areas of Rivers State.",
        href: "#chukwudi-dimkpa-foundation",
    },
];

const FOUNDER_LETTER = [
    "Every meaningful institution is built on a decision to serve before asking others to believe.",
    "As Founder and President of Ashford & Gray Fusion Academy, I have always believed that true leadership begins with personal responsibility. Before inviting organizations, public leaders, foundations, and individuals to invest in human capital development, I considered it both a privilege and a duty to make the first investment myself.",
    "In line with this commitment, I am pleased to personally sponsor 10 beneficiaries into the Academy's Executive Operations Flagship Programme—a three-month online professional development programme designed to equip participants with globally relevant knowledge, leadership competencies, operational excellence, and practical workplace skills.",
    "This initiative is more than a scholarship. It is a declaration of what Ashford & Gray Fusion Academy stands for.",
    "We believe that education should create opportunity, that leadership should inspire transformation, and that every individual deserves access to learning that unlocks potential and prepares them for meaningful contribution to society.",
    "As these first beneficiaries begin their journey, I hope they will become ambassadors of excellence, integrity, professionalism, and service within their communities and workplaces.",
    "This commitment also marks the beginning of what has become the Academy's Impact Partnership Initiative—a growing movement that brings together visionary leaders, institutions, foundations, and organizations who share a common belief that investing in people remains the most sustainable investment any society can make.",
    "I am deeply grateful to every partner who has chosen to walk this journey with us, and I remain committed to ensuring that every sponsorship entrusted to the Academy results in measurable transformation, credible learning outcomes, and lasting community impact.",
    "This is only the beginning.",
    "Together, we will continue to empower people, elevate futures, and transform communities—one learner, one partner, and one success story at a time.",
];

const CECILIA_PRESS_RELEASE = {
    headline: "Ashford & Gray Fusion Academy Celebrates Cecilia Iniperitiari Dikibo's Sponsorship of Eight Candidates Through the Impact & Partnerships Development Initiative",
    intro: [
        "Ashford & Gray Fusion Academy is delighted to recognize and celebrate Cecilia Iniperitiari Dikibo, Vice President and Director of Brand Strategy, for her generous commitment to sponsor eight (8) deserving candidates across Rivers State under the Academy's Impact & Partnerships Development Initiative.",
        "This remarkable gesture reflects Cecilia's unwavering belief in the transformative power of education and her commitment to empowering individuals with the knowledge, skills, and opportunities needed to excel personally and professionally.",
        "Through her sponsorship, eight beneficiaries will gain access to the Academy's Executive Certificate Programmes, where they will receive industry-relevant training delivered by experienced facilitators across key areas of hospitality, business innovation, executive management, and professional development.",
        "Speaking on the initiative, Myne Wilfred, Founder and President of Ashford & Gray Fusion Academy, expressed profound appreciation for Cecilia's continued support of the Academy's vision.",
    ],
    quote: "Cecilia's sponsorship is more than an investment in education; it is an investment in people, in potential, and in the future of our communities. Her generosity embodies the spirit of servant leadership and demonstrates how meaningful partnerships can transform lives.",
    outro: [
        "The sponsored candidates will join the Academy's 2026 Executive Certificate Cohort, with classes scheduled to commence on 4 September 2026 and conclude on 30 November 2026.",
        "This sponsorship forms part of the Academy's broader mission to expand access to quality professional education through strategic partnerships with individuals, organizations, foundations, and public leaders who share a passion for developing human capacity.",
        "To date, the generosity of the Academy's distinguished Impact Partners has provided sponsorship opportunities for 258 beneficiaries, creating pathways for learning, career advancement, and sustainable community development.",
        "Ashford & Gray Fusion Academy sincerely appreciates Cecilia Iniperitiari Dikibo for her outstanding generosity and steadfast commitment to empowering others through education. Her contribution will undoubtedly leave a lasting legacy in the lives of the beneficiaries and the communities they will go on to serve.",
        "The Academy welcomes individuals, corporate organizations, foundations, and public institutions who wish to join the Impact & Partnerships Development Initiative and become part of a growing movement dedicated to transforming lives through education.",
    ],
    about: "Ashford and Gray Fusion Academy is a premium professional learning institution committed to equipping individuals with practical skills, leadership competencies, business knowledge, and hospitality excellence required to succeed in a dynamic global environment. The Academy offers innovative programmes in hospitality management, business innovation, leadership development, executive operations, protocol and events management, and professional development.",
};

const LINDA_PRESS_RELEASE = {
    headline: "Hon. Linda Somiari Stewart Sponsors 10 Constituents for Professional Skills Training Through Ashford and Gray Fusion Academy",
    intro: [
        "Ashford and Gray Fusion Academy is pleased to announce the sponsorship of ten (10) beneficiaries from Okrika Constituency through the generous support of Hon. Linda Somiari Stewart, Member representing Okrika Constituency.",
        "This initiative reflects a shared commitment to empowering individuals through education, skills acquisition, and professional development. The sponsored beneficiaries will participate in structured online training designed to equip them with practical competencies, leadership values, and workplace-ready skills that can enhance their employability and entrepreneurial capacity.",
        "Speaking on the development, Myne Wilfred, Founder and President of Ashford and Gray Fusion Academy, expressed profound appreciation for the gesture.",
    ],
    quote: "True leadership is demonstrated not only in policymaking but also in creating opportunities that transform lives. We commend Hon. Linda Somiari Stewart for investing in people and for recognising that sustainable development begins with empowering individuals with the right knowledge, skills, and values.",
    outro: [
        "The Academy believes that initiatives such as this contribute meaningfully to community advancement by opening doors for growth, dignity, and self-reliance.",
        "Ashford and Gray Fusion Academy remains committed to partnering with individuals, organisations, and institutions that share its vision of developing globally competitive professionals and responsible leaders.",
        "The Academy extends its sincere gratitude to Hon. Linda Somiari Stewart for this remarkable demonstration of leadership and social responsibility and looks forward to witnessing the positive impact this sponsorship will have on the lives of the beneficiaries and the wider Okrika community.",
    ],
    about: "Ashford and Gray Fusion Academy is an Online professional learning institution dedicated to advancing excellence through training in hospitality, leadership, business innovation, executive operations, and professional development.",
};

const ANDERSON_PRESS_RELEASE = {
    headline: "Hon. Anderson Allison Igbiks Partners with Ashford and Gray Fusion Academy to Sponsor 30 Beneficiaries Under Educational Support Initiative",
    intro: [
        "Ashford and Gray Fusion Academy is delighted to announce a landmark partnership with Hon. Anderson Allison Igbiks, Member representing Okrika/Ogu Bolo Federal Constituency in the House of Representatives, who has graciously committed to sponsoring thirty (30) beneficiaries as part of his Educational Support Initiative.",
        "This strategic partnership is aimed at expanding access to quality professional education, skills acquisition, leadership development, and capacity building for constituents within the Okrika/Ogu Bolo Federal Constituency.",
        "The beneficiaries will undergo structured training through Ashford and Gray Fusion Academy's professionally designed online learning platform, equipping them with practical competencies, industry-relevant knowledge, leadership values, and entrepreneurial skills necessary to thrive in today's rapidly evolving world.",
        "Speaking on the partnership, Myne Wilfred, Founder and President of Ashford Gray Fusion Academy, expressed profound appreciation to Hon. Igbiks for his visionary leadership and unwavering commitment to human capital development.",
    ],
    quote: "We are deeply honoured by the confidence reposed in our institution by Hon. Anderson Allison Igbiks. This partnership goes beyond sponsorship; it is an investment in people, potential, and the future of our communities. We firmly believe that education remains one of the most powerful tools for sustainable development and social transformation.",
    outro: [
        "She further noted that the initiative aligns perfectly with the Academy's mission of empowering individuals through professional education, practical training, and transformational leadership.",
        "The sponsorship initiative reflects Hon. Igbiks' enduring commitment to educational advancement, youth empowerment, and the socio-economic development of the Okrika/Ogu Bolo Federal Constituency.",
    ],
    benefits: [
        "100% sponsored professional training.",
        "Practical skills development.",
        "Professional mentorship and guidance.",
        "Leadership and entrepreneurial development.",
        "Certificate of completion upon successful participation.",
        "Access to a network of professionals and growth opportunities.",
    ],
    closing: [
        "Ashford and Gray Fusion Academy commends Hon. Anderson Allison Igbiks for this remarkable demonstration of servant leadership and his dedication to creating opportunities that empower constituents to become productive contributors to society.",
        "This partnership further reinforces the Academy's commitment to collaborating with government institutions, corporate organisations, development agencies, and visionary leaders in advancing human capital development and transforming lives through education.",
    ],
    about: "Ashford and Gray Fusion Academy is a premium professional learning institution committed to equipping individuals with practical skills, leadership competencies, business knowledge, and hospitality excellence required to succeed in a dynamic global environment. The Academy offers innovative programmes in hospitality management, business innovation, leadership development, executive operations, protocol and events management, and professional development.",
};

export default function PartnersPage() {
    return (
        <div className="bg-[#FAF9F6] min-h-screen">

            {/* ── PAGE HEADER ──────────────────────────────── */}
            <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A]">
                <div className="container mx-auto px-6 lg:px-20 py-20 lg:py-28">
                    <Reveal className="max-w-3xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-[#C8A96A]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A]/70">
                                Ashford &amp; Gray Fusion Academy
                            </span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-serif text-white leading-tight tracking-tight">
                            Impact<br />
                            <span className="text-[#C8A96A]">&amp; Partners.</span>
                        </h1>
                        <p className="text-lg font-serif italic text-white/60 leading-relaxed max-w-xl">
                            Celebrating the Partners and Sponsors Behind Our Impact
                        </p>
                    </Reveal>
                </div>
            </div>

            {/* ── MAIN WRITE-UP ────────────────────────────── */}
            <div className="bg-white border-b border-[#0B1F3A]/10">
                <div className="container mx-auto px-6 lg:px-20 py-16 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2px_1fr] gap-12 lg:gap-16 items-start">
                        <Reveal className="space-y-6">
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
                        </Reveal>
                        <div className="hidden lg:block bg-[#C8A96A]/20 self-stretch" />
                        <Reveal delay={0.15} className="space-y-6">
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
                        </Reveal>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-20 py-16 lg:py-24 space-y-24">

                {/* ── OUR GROWING IMPACT: STATS ─────────────── */}
                <section className="space-y-12">
                    <Reveal className="text-center max-w-2xl mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-2 h-8 bg-[#C8A96A]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">
                                Our Growing Impact
                            </span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-serif text-[#0B1F3A] font-bold tracking-tight">
                            Building Lives Through Strategic Partnerships
                        </h2>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                        {IMPACT_STATS.map((s, idx) => (
                            <ImpactStat key={s.label} value={s.value} label={s.label} delay={idx * 0.15} />
                        ))}
                    </div>
                </section>

                {/* ── MEET OUR IMPACT PARTNERS ──────────────── */}
                <section className="space-y-12">
                    <Reveal className="flex items-center gap-4 border-b border-[#0B1F3A]/10 pb-6">
                        <Users className="w-5 h-5 text-[#C8A96A]" />
                        <h2 className="text-sm font-black text-[#0B1F3A] uppercase tracking-[0.3em]">
                            Meet Our Impact Partners
                        </h2>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {IMPACT_PARTNERS.map((p, idx) => (
                            <Reveal key={p.id} delay={idx * 0.12} className="flex flex-col border border-[#0B1F3A]/10 bg-white p-8 border-t-4 border-t-[#C8A96A] shadow-sm">
                                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">0{idx + 1}</span>
                                <h3 className="mt-3 font-serif text-lg font-bold text-[#0B1F3A] leading-snug">{p.name}</h3>
                                <p className="mt-1 text-[11px] font-medium text-slate-500 leading-relaxed">{p.title}</p>
                                <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[#0B1F3A]/70">
                                    {p.beneficiaries} Beneficiaries Sponsored
                                </p>
                                <p className="mt-4 flex-1 text-sm font-serif italic text-slate-600 leading-relaxed">
                                    &ldquo;{p.quote}&rdquo;
                                </p>
                                <a
                                    href={p.href}
                                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A] hover:text-[#C8A96A] transition-colors"
                                >
                                    Read Full Story <span aria-hidden="true">→</span>
                                </a>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ── FOUNDER'S COMMITMENT: FULL STORY ──────── */}
                <section id="founders-commitment" className="scroll-mt-24 space-y-6">
                    <Reveal className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6 lg:p-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-2">Founder&apos;s Commitment to Human Capital Development</p>
                        <h3 className="text-2xl lg:text-3xl font-serif text-white leading-tight">
                            Investing First. <span className="text-[#C8A96A]">Leading by Example.</span>
                        </h3>
                    </Reveal>

                    <Reveal delay={0.1} className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] bg-white border border-[#0B1F3A]/10 shadow-sm overflow-hidden">
                        <div className="relative min-h-[420px] lg:min-h-0 bg-[#0B1F3A]">
                            <Image
                                src="/partners/myne-wilfred-founder.jpeg"
                                alt="Myne Wilfred — Founder & President, Ashford & Gray Fusion Academy"
                                fill
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Founder &amp; President</p>
                                <p className="text-white font-serif font-bold text-base leading-snug">Myne Wilfred</p>
                            </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-5 border-l border-[#0B1F3A]/8">
                            <div className="flex items-center gap-3">
                                <Quote className="w-5 h-5 text-[#C8A96A] flex-shrink-0" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">A Personal Investment in Human Capital Development</span>
                            </div>
                            <div className="space-y-3 text-[13px] font-serif text-slate-600 leading-relaxed max-h-[520px] overflow-y-auto pr-2">
                                {FOUNDER_LETTER.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-[#0B1F3A]/8">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Myne Wilfred — Founder &amp; President</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 italic font-serif">Ashford &amp; Gray Fusion Academy — Institute of Hospitality &amp; Business Innovation</p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ── Cecilia Iniperitiari Dikibo: FULL STORY ──────── */}
                <section id="cecilia-dikibo" className="scroll-mt-24 space-y-6">
                    <Reveal className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6 lg:p-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-2">Press Release · 8 Beneficiaries Sponsored</p>
                        <h3 className="text-xl lg:text-2xl font-serif text-white leading-tight">
                            {CECILIA_PRESS_RELEASE.headline}
                        </h3>
                    </Reveal>

                    <Reveal delay={0.1} className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] bg-white border border-[#0B1F3A]/10 shadow-sm overflow-hidden">
                        <div className="relative min-h-[420px] lg:min-h-0 bg-[#0B1F3A]">
                            <Image
                                src="/partners/cecilia-dikibo.jpeg"
                                alt="Cecilia Iniperitiari Dikibo — Vice President & Director of Brand Strategy"
                                fill
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Vice President &amp; Director of Brand Strategy</p>
                                <p className="text-white font-serif font-bold text-base leading-snug">Cecilia Iniperitiari Dikibo</p>
                            </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-5 border-l border-[#0B1F3A]/8">
                            <div className="flex items-center gap-3">
                                <Quote className="w-5 h-5 text-[#C8A96A] flex-shrink-0" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">Investing in People and Potential</span>
                            </div>
                            <div className="space-y-3 text-[13px] font-serif text-slate-600 leading-relaxed max-h-[520px] overflow-y-auto pr-2">
                                {CECILIA_PRESS_RELEASE.intro.map((p, i) => (
                                    <p key={`intro-${i}`}>{p}</p>
                                ))}
                                <p className="italic text-[#0B1F3A] font-bold">&ldquo;{CECILIA_PRESS_RELEASE.quote}&rdquo;</p>
                                {CECILIA_PRESS_RELEASE.outro.map((p, i) => (
                                    <p key={`outro-${i}`}>{p}</p>
                                ))}
                                <p className="pt-2 font-bold text-[#0B1F3A]">About Ashford and Gray Fusion Academy</p>
                                <p>{CECILIA_PRESS_RELEASE.about}</p>
                            </div>
                            <div className="pt-2 border-t border-[#0B1F3A]/8">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 italic font-serif">Mastering Luxury, Elevating Business. · www.ashfordandgrayfusionacademy.com</p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ── PARTNER PROFILES: PRESS RELEASES ──────── */}
                <section className="space-y-16">
                    {/* ── Hon. Linda Somiari Stewart ──────────── */}
                    <div id="linda-somiari-stewart" className="scroll-mt-24 space-y-6">
                        <Reveal className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6 lg:p-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-2">Press Release · 10 Beneficiaries Sponsored</p>
                            <h3 className="text-xl lg:text-2xl font-serif text-white leading-tight">
                                {LINDA_PRESS_RELEASE.headline}
                            </h3>
                        </Reveal>

                        <Reveal delay={0.1} className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] bg-white border border-[#0B1F3A]/10 shadow-sm overflow-hidden">
                            <div className="relative min-h-[420px] lg:min-h-0 bg-[#0B1F3A]">
                                <Image
                                    src="/partners/partner-2.png"
                                    alt="Amaopuerembo Hon Linda Somiari-Stewart DSSRS — Esteemed Partner"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                    className="object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Rivers State House of Assembly</p>
                                    <p className="text-white font-serif font-bold text-base leading-snug">Amaopuerembo Hon Linda Somiari-Stewart DSSRS</p>
                                </div>
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center space-y-5 border-l border-[#0B1F3A]/8">
                                <div className="flex items-center gap-3">
                                    <Quote className="w-5 h-5 text-[#C8A96A] flex-shrink-0" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">Investing in Okrika Constituency</span>
                                </div>
                                <div className="space-y-3 text-[13px] font-serif text-slate-600 leading-relaxed max-h-[520px] overflow-y-auto pr-2">
                                    {LINDA_PRESS_RELEASE.intro.map((p, i) => (
                                        <p key={`intro-${i}`}>{p}</p>
                                    ))}
                                    <p className="italic text-[#0B1F3A] font-bold">&ldquo;{LINDA_PRESS_RELEASE.quote}&rdquo;</p>
                                    {LINDA_PRESS_RELEASE.outro.map((p, i) => (
                                        <p key={`outro-${i}`}>{p}</p>
                                    ))}
                                    <p className="pt-2 font-bold text-[#0B1F3A]">About Ashford and Gray Fusion Academy</p>
                                    <p>{LINDA_PRESS_RELEASE.about}</p>
                                </div>
                                <div className="pt-2 border-t border-[#0B1F3A]/8">
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 italic font-serif">Mastering Luxury, Elevating Business. · www.ashfordandgrayfusionacademy.com</p>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* ── Hon. Anderson Allison Igbiks ─────────── */}
                    <div id="anderson-allison-igbiks" className="scroll-mt-24 space-y-6">
                        <Reveal className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6 lg:p-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-2">Press Release · 30 Beneficiaries Sponsored</p>
                            <h3 className="text-xl lg:text-2xl font-serif text-white leading-tight">
                                {ANDERSON_PRESS_RELEASE.headline}
                            </h3>
                        </Reveal>

                        <Reveal delay={0.1} className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] bg-white border border-[#0B1F3A]/10 shadow-sm overflow-hidden">
                            <div className="relative min-h-[420px] lg:min-h-0 bg-[#0B1F3A]">
                                <Image
                                    src="/partners/partner-1.png"
                                    alt="Hon. Allison Anderson Igbiks — Esteemed Partner"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                    className="object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">House of Representatives</p>
                                    <p className="text-white font-serif font-bold text-base leading-snug">Hon. Anderson Allison Igbiks</p>
                                </div>
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center space-y-5 border-l border-[#0B1F3A]/8">
                                <div className="flex items-center gap-3">
                                    <Quote className="w-5 h-5 text-[#C8A96A] flex-shrink-0" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">Educational Support Initiative</span>
                                </div>
                                <div className="space-y-3 text-[13px] font-serif text-slate-600 leading-relaxed max-h-[520px] overflow-y-auto pr-2">
                                    {ANDERSON_PRESS_RELEASE.intro.map((p, i) => (
                                        <p key={`intro-${i}`}>{p}</p>
                                    ))}
                                    <p className="italic text-[#0B1F3A] font-bold">&ldquo;{ANDERSON_PRESS_RELEASE.quote}&rdquo;</p>
                                    {ANDERSON_PRESS_RELEASE.outro.map((p, i) => (
                                        <p key={`outro-${i}`}>{p}</p>
                                    ))}
                                    <p className="pt-1 font-bold text-[#0B1F3A]">Through this intervention, beneficiaries will gain access to:</p>
                                    <ul className="space-y-1.5 list-none pl-0">
                                        {ANDERSON_PRESS_RELEASE.benefits.map((b, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C8A96A] flex-shrink-0" />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {ANDERSON_PRESS_RELEASE.closing.map((p, i) => (
                                        <p key={`closing-${i}`}>{p}</p>
                                    ))}
                                    <p className="pt-2 font-bold text-[#0B1F3A]">About Ashford and Gray Fusion Academy</p>
                                    <p>{ANDERSON_PRESS_RELEASE.about}</p>
                                </div>
                                <div className="pt-2 border-t border-[#0B1F3A]/8">
                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 italic font-serif">Mastering Luxury, Elevating Business.</p>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                </section>

                {/* ── IMPACT ───────────────────────────────── */}
                <section id="chukwudi-dimkpa-foundation" className="scroll-mt-24 space-y-6">
                    {/* ── FEATURE: Chukwudi Dimkpa Foundation Partnership ─── */}
                    <Reveal delay={0.05} className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6 lg:p-10 mb-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C8A96A] mb-2">Featured Impact Story</p>
                        <h3 className="text-2xl lg:text-3xl font-serif text-white leading-tight">
                            A Partnership for People. A Commitment to the Future.<br />
                            <span className="text-[#C8A96A]">Chukwudi Dimkpa Human Capital Development Initiative</span>
                        </h3>
                    </Reveal>

                    {/* ── Card: Dimkpa Foundation write-up + portrait ── */}
                    <Reveal delay={0.1} className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] bg-white border border-[#0B1F3A]/10 shadow-sm overflow-hidden">
                        <div className="relative min-h-[420px] lg:min-h-0 bg-[#0B1F3A]">
                            <Image
                                src="/partners/chukwudi-dimkpa.png"
                                alt="Chief Engr. Chukwudi Dimkpa — Chukwudi Dimkpa Foundation"
                                fill
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Chukwudi Dimkpa Foundation</p>
                                <p className="text-white font-serif font-bold text-base leading-snug">Chief Engr. Chukwudi Dimkpa</p>
                            </div>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-5 border-l border-[#0B1F3A]/8">
                            <div className="flex items-center gap-3">
                                <Quote className="w-5 h-5 text-[#C8A96A] flex-shrink-0" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/50">A Partnership for People</span>
                            </div>
                            <p className="text-[13px] font-serif text-[#0B1F3A] font-bold leading-snug">
                                A Commitment to the Future.
                            </p>
                            <div className="space-y-3 text-[13px] font-serif text-slate-600 leading-relaxed max-h-[520px] overflow-y-auto pr-2">
                                <p>Ashford and Gray Fusion Academy is honoured to announce a landmark partnership with Chief Engr. Chukwudi Dimkpa, through the Chukwudi Dimkpa Foundation, in a bold commitment to human capital development across Rivers State.</p>
                                <p>Through this remarkable partnership, the Chukwudi Dimkpa Foundation has graciously sponsored 200 beneficiaries across the 23 Local Government Areas of Rivers State, reaffirming its dedication to expanding educational opportunities and empowering individuals through knowledge, leadership, and practical skills development.</p>
                                <p>This initiative is more than a sponsorship programme: it is a strategic investment in people, potential, and the future of our state.</p>
                                <p>Through this partnership, 200 deserving individuals will receive professional training, leadership development, practical skills, mentorship, and globally relevant learning opportunities designed to prepare them for meaningful careers, entrepreneurship, and lifelong growth.</p>
                                <p>At Ashford and Gray Fusion Academy, we have always believed that the greatest investment any society can make is in its people. When opportunities are created, lives are transformed. When education is made accessible, communities become stronger.</p>
                                <p>We therefore express our profound appreciation to Chief Engr. Chukwudi Dimkpa and the Chukwudi Dimkpa Foundation for embracing this vision and demonstrating, through action, that lasting impact begins with empowering others.</p>
                                <p>Together, we are building a future where talent is nurtured, leadership is developed, and opportunity reaches every corner of Rivers State.</p>
                                <p>Today, we celebrate not only a partnership but a shared commitment to developing people and strengthening communities through education.</p>
                                <p>Thank you, Chief Engr. Chukwudi Dimkpa and the Chukwudi Dimkpa Foundation, for choosing to invest in the dreams, potential, and future of Rivers people.</p>
                                <p className="font-bold text-[#0B1F3A]">200 Beneficiaries. 23 Local Government Areas. One Shared Vision.</p>
                            </div>
                            <div className="pt-2 border-t border-[#0B1F3A]/8">
                                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 italic font-serif">Empowering People. Elevating Futures. Transforming Communities.</p>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal className="border border-[#C8A96A]/20 bg-[#0B1F3A] p-10 lg:p-14 max-w-3xl border-l-4 border-l-[#C8A96A]">
                        <p className="text-base font-serif italic text-white/80 leading-relaxed">
                            &ldquo;To our sponsors and partners, thank you for believing in our vision.&rdquo;
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            <div className="w-8 h-px bg-[#C8A96A]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-[#C8A96A]">Myne Wilfred — Founder/President</span>
                        </div>
                    </Reveal>
                </section>

                {/* ── CLOSING STATEMENT ────────────────────── */}
                <Reveal>
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
                </Reveal>

            </div>
        </div>
    );
}

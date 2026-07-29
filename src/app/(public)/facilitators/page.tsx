import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FACILITATORS, type Facilitator } from "@/lib/facilitators-data";
import { ProfileDialog } from "./profile-dialog";

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

export default function FacilitatorsPage() {
    return (
        <div className="bg-white">
            {/* Hero */}
            <header className="border-b border-slate-100">
                <div className="container px-6 lg:px-12 py-20 md:py-28">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-[1px] bg-[#C8A96A]" />
                        <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">The Institution</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-[1.05] max-w-4xl">
                        Meet Our Facilitators
                    </h1>
                    <p className="text-lg md:text-xl font-serif italic text-slate-500 mt-6 max-w-2xl">
                        Learn from Professionals Who Have Led, Served and Delivered
                    </p>
                </div>
            </header>

            {/* Introduction */}
            <section className="container px-6 lg:px-12 py-20 md:py-28 max-w-4xl mx-auto">
                <div className="space-y-6 text-base md:text-lg text-slate-700 leading-relaxed font-medium">
                    <p>
                        At Ashford &amp; Gray Fusion Academy (AGFA), we believe that exceptional education is best delivered by exceptional practitioners.
                    </p>
                    <p>
                        Our facilitators are not simply instructors—they are accomplished professionals, executives, consultants, entrepreneurs, and industry leaders who have spent decades building careers, leading organizations, solving real-world challenges, and shaping the future of their respective fields.
                    </p>
                    <p>
                        Every lecture, discussion, case study, and practical exercise is enriched by firsthand experience gained from boardrooms, corporate organizations, hospitality establishments, government institutions, international projects, and executive leadership roles.
                    </p>
                    <p>
                        This commitment ensures that our students receive more than theoretical knowledge. They gain practical insights, proven strategies, professional standards, and industry perspectives that can be applied immediately in the workplace.
                    </p>
                    <p>
                        Our faculty represents a diverse blend of expertise across hospitality management, executive operations, leadership development, business innovation, finance, human resource management, labour relations, communications, branding, protocol management, restaurant operations, entrepreneurship, customer experience, and organizational excellence.
                    </p>
                    <p>
                        United by a shared passion for excellence and lifelong learning, each facilitator is carefully selected not only for professional achievement but also for integrity, commitment to mentoring others, and the ability to inspire meaningful transformation.
                    </p>
                    <p>
                        Whether you are an aspiring professional, an experienced executive, a business owner, or an organization seeking to develop your workforce, you can be confident that you are learning from individuals who have successfully navigated the very challenges they teach.
                    </p>
                    <p>
                        At AGFA, education goes beyond the classroom. It is a transfer of experience, wisdom, professional discipline, and practical excellence.
                    </p>
                    <p>
                        We invite you to meet the distinguished professionals who make this learning experience possible and who continue to uphold our commitment to delivering education that is relevant, practical, impactful, and globally aligned.
                    </p>
                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                        <p className="text-sm italic text-slate-400 mt-1">Mastering Luxury. Elevating Business.</p>
                    </div>
                </div>
            </section>

            {/* Facilitators List */}
            <section className="bg-[#FAF9F6] border-y border-slate-100">
                <div className="container px-6 lg:px-12 py-20 md:py-28 max-w-4xl mx-auto">
                    <div className="mb-14">
                        <h2 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] leading-tight uppercase tracking-wider">
                            Our Facilitators
                        </h2>
                        <div className="w-16 h-[2px] bg-[#C8A96A] mt-6" />
                    </div>

                    <div className="space-y-12">
                        {FACILITATORS.map((facilitator) => (
                            <FacilitatorRow key={facilitator.slug} facilitator={facilitator} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white">
                <div className="container px-6 lg:px-12 py-24 md:py-32 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight mb-10 max-w-2xl mx-auto leading-tight">
                        Learn directly from those who have led, served, and delivered.
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild className="h-14 px-10 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.4em] rounded-none shadow-none border-none">
                            <Link href="/login?view=signup">Apply for Admission</Link>
                        </Button>
                        <Button asChild variant="outline" className="h-14 px-10 border-slate-200 text-[#0B1F3A] hover:bg-slate-50 rounded-none font-black text-[10px] uppercase tracking-[0.4em]">
                            <Link href="/contact">Contact the Registry</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FacilitatorRow({ facilitator }: { facilitator: Facilitator }) {
    return (
        <article className="border-l-2 border-[#C8A96A] pl-6 py-2 flex items-start gap-5 sm:gap-7">
            <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-full ring-1 ring-slate-200 bg-[#0B1F3A]">
                {facilitator.photo ? (
                    <Image
                        src={facilitator.photo}
                        alt={facilitator.name}
                        fill
                        sizes="96px"
                        className="object-cover object-top"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-serif font-bold text-[#C8A96A]">{initials(facilitator.name)}</span>
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <h3 className="text-2xl font-serif text-[#0B1F3A] leading-tight">
                    {facilitator.name} {facilitator.title ? `– ${facilitator.title}` : ''}
                </h3>
                {facilitator.postNominals && (
                    <p className="text-xs text-slate-500 italic font-semibold mt-1">{facilitator.postNominals}</p>
                )}
                <div className="mt-4">
                    <ProfileDialog facilitator={facilitator} />
                </div>
            </div>
        </article>
    );
}

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LEADERSHIP, type LeadershipMember } from "@/lib/leadership-data";
import { ProfileDialog } from "./profile-dialog";

export const metadata = {
    title: "Executive Management Council — Ashford & Gray Fusion Academy",
    description:
        "The Executive Management Council of Ashford & Gray Fusion Academy represents the institution’s strategic leadership and operational governance structure.",
};

export default function ExecutiveManagementCouncilPage() {
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
                        Executive Management Council
                    </h1>
                </div>
            </header>

            {/* Introduction & Vision */}
            <section className="container px-6 lg:px-12 py-20 md:py-28 max-w-4xl mx-auto">
                <div className="space-y-8 text-base md:text-lg text-slate-700 leading-relaxed font-medium">
                    <h2 className="text-2xl font-serif text-[#0B1F3A] uppercase tracking-wider mb-4">THE EXECUTIVE MANAGEMENT COUNCIL</h2>
                    <p>
                        The Executive Management Council (EMC) of Ashford &amp; Gray Fusion Academy represents the institution’s strategic leadership and operational governance structure, bringing together professionals from diverse fields including hospitality, business innovation, communications, finance, academic development, administration, and institutional partnerships.
                    </p>
                    <p>
                        The Council exists to provide visionary direction, academic oversight, operational structure, and sustainable institutional growth in alignment with the Academy’s commitment to excellence, discipline, leadership, and global relevance.
                    </p>
                    <p>
                        Comprised of individuals with professional experience and strategic competence across multiple sectors, the Executive Management Council functions as the driving force behind the Academy’s mission to develop globally relevant professionals equipped with practical knowledge, executive discipline, leadership capacity, and innovative thinking.
                    </p>
                    <p>
                        The Council is committed to building an institution that reflects:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700">
                        <li>Academic credibility,</li>
                        <li>Operational professionalism,</li>
                        <li>Institutional integrity,</li>
                        <li>Executive functionality,</li>
                        <li>And industry relevance.</li>
                    </ul>
                    <p>
                        As a fully online institution, Ashford &amp; Gray Fusion Academy recognizes the importance of structured leadership, collaborative governance, and continuous innovation in delivering impactful learning experiences across hospitality, business, leadership, protocol management, entrepreneurship, and professional development.
                    </p>
                    <p>
                        Guided by the Academy’s philosophy of “The Silent Standard,” the Executive Management Council remains committed to fostering a culture of:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700">
                        <li>excellence without noise,</li>
                        <li>structure without confusion,</li>
                        <li>leadership with responsibility,</li>
                        <li>and professionalism with purpose.</li>
                    </ul>
                    <p>
                        Together, the Council continues to drive the Academy toward becoming a globally respected institution for executive and professional education.
                    </p>
                </div>
            </section>

            {/* Council Members List */}
            <section className="bg-[#FAF9F6] border-y border-slate-100">
                <div className="container px-6 lg:px-12 py-20 md:py-28 max-w-4xl mx-auto">
                    <div className="mb-14">
                        <h2 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] leading-tight uppercase tracking-wider">
                            ASHFORD AND GRAY FUSION ACADEMY EXECUTIVE MANAGEMENT COUNCIL (EMC)
                        </h2>
                        <div className="w-16 h-[2px] bg-[#C8A96A] mt-6" />
                    </div>

                    <div className="space-y-12">
                        {LEADERSHIP.map((member) => (
                            <LeadershipRow key={member.slug} member={member} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white">
                <div className="container px-6 lg:px-12 py-24 md:py-32 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight mb-10 max-w-2xl mx-auto leading-tight">
                        Become part of the next cohort.
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild className="h-14 px-10 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.4em] rounded-none shadow-none border-none">
                            <Link href="/login?view=signup">Apply for Admission</Link>
                        </Button>
                        <Button asChild variant="outline" className="h-14 px-10 border-slate-200 text-[#0B1F3A] hover:bg-slate-50 rounded-none font-black text-[10px] uppercase tracking-[0.4em]">
                            <Link href="/contact">Contact the Leadership Office</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function LeadershipRow({ member }: { member: LeadershipMember }) {
    return (
        <article className="border-l-2 border-[#C8A96A] pl-6 py-2 flex items-start gap-5 sm:gap-7">
            <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-full ring-1 ring-slate-200 bg-slate-100">
                <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="96px"
                    className="object-cover object-top"
                />
            </div>
            <div className="min-w-0">
                <h3 className="text-2xl font-serif text-[#0B1F3A] leading-tight">
                    {member.name} {member.title ? `– ${member.title}` : ''}
                </h3>
                {member.postNominals && (
                    <p className="text-xs text-slate-500 italic font-semibold mt-1">{member.postNominals}</p>
                )}
                <div className="mt-4">
                    <ProfileDialog member={member} />
                </div>
            </div>
        </article>
    );
}

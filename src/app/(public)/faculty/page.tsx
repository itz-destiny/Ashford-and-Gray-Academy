import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LEADERSHIP, type LeadershipMember } from "@/lib/leadership-data";
import { ProfileDialog } from "./profile-dialog";

export const metadata = {
    title: "Executive Leadership Team — Ashford & Gray Fusion Academy",
    description:
        "The Executive Leadership Team of Ashford & Gray Fusion Academy — the founder, directors, dean, registrar, and partnership leads stewarding every cohort.",
};

export default function ExecutiveLeadershipPage() {
    const [founder, ...team] = LEADERSHIP;

    return (
        <div className="bg-white">
            {/* Hero — tight, editorial */}
            <header className="border-b border-slate-100">
                <div className="container px-6 lg:px-12 py-20 md:py-28">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-[1px] bg-[#C8A96A]" />
                        <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">The Institution</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-[1.05] max-w-4xl">
                        Executive Leadership Team
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mt-8 leading-relaxed">
                        Practitioners of standing — law, finance, communications, engineering, education, and research — directing every dimension of Ashford &amp; Gray Fusion Academy.
                    </p>
                </div>
            </header>

            {/* Founder feature row */}
            <section className="container px-6 lg:px-12 py-20 md:py-28">
                <div className="grid lg:grid-cols-[440px_1fr] gap-14 md:gap-20 items-start">
                    <div className="relative w-full max-w-md mx-auto lg:mx-0">
                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                            <Image
                                src={founder.photo}
                                alt={founder.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 440px"
                                className="object-cover object-top"
                                priority
                            />
                        </div>
                        <div className="absolute -bottom-4 left-4 right-4 h-1 bg-[#C8A96A]" />
                    </div>

                    <div className="space-y-6 lg:pt-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.4em]">{founder.title}</p>
                            <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] leading-[1.1]">{founder.name}</h2>
                            {founder.postNominals && (
                                <p className="text-sm text-slate-500 italic font-semibold">{founder.postNominals}</p>
                            )}
                        </div>
                        <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                            {founder.bio[0]}
                        </p>
                        <ProfileDialog member={founder} variant="primary" />
                    </div>
                </div>
            </section>

            {/* Directors grid */}
            <section className="bg-[#FAF9F6] border-y border-slate-100">
                <div className="container px-6 lg:px-12 py-20 md:py-28">
                    <div className="flex items-end justify-between gap-8 mb-14 md:mb-20">
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-[1px] bg-[#1F7A5A]" />
                                <span className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.4em]">Directing Team</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif text-[#0B1F3A] leading-tight">
                                The directors stewarding the Academy.
                            </h2>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                        {team.map((member) => (
                            <LeadershipCard key={member.slug} member={member} />
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

function LeadershipCard({ member }: { member: LeadershipMember }) {
    return (
        <article className="group">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 mb-6">
                <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-top grayscale-[0.15] group-hover:grayscale-0 transition-[filter] duration-500"
                />
                <div className="absolute -bottom-px left-0 w-12 h-[3px] bg-[#C8A96A]" />
            </div>
            <div className="space-y-3">
                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.35em]">{member.title}</p>
                <h3 className="text-xl md:text-2xl font-serif text-[#0B1F3A] leading-tight">{member.name}</h3>
                {member.postNominals && (
                    <p className="text-[11px] text-slate-500 italic font-semibold">{member.postNominals}</p>
                )}
                <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-3 pt-1">
                    {member.bio[0]}
                </p>
                <ProfileDialog member={member} />
            </div>
        </article>
    );
}

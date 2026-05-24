import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export const metadata = {
    title: "Faculty & Leadership — Ashford & Gray Fusion Academy",
    description: "Meet the founder, faculty, and industry advisors shaping the next generation of luxury hospitality and business leaders.",
};

export default function FacultyPage() {
    return (
        <div className="bg-white">
            {/* Banner */}
            <header className="py-24 md:py-32 text-center border-b border-slate-50">
                <div className="container px-6 lg:px-12">
                    <ScrollAnimation animation="fade-in-up">
                        <div className="inline-flex items-center gap-3 mb-8">
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Faculty &amp; Leadership</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                            Leadership That <br />
                            <span className="italic text-[#C8A96A]">Defines Excellence.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
                            The Academy is built around a community of distinguished practitioners — leaders and authorities who do not simply teach the discipline; they live it.
                        </p>
                    </ScrollAnimation>
                </div>
            </header>

            {/* Founder Spotlight */}
            <section className="py-24 md:py-32">
                <div className="container px-6 lg:px-12">
                    <ScrollAnimation animation="fade-in">
                        <div className="inline-flex items-center gap-3 mb-10">
                            <div className="w-12 h-[1px] bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Founder &amp; President</span>
                        </div>
                    </ScrollAnimation>
                    <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start">
                        <ScrollAnimation animation="fade-in">
                            <div className="relative max-w-lg">
                                <div className="absolute -inset-6 bg-[#C8A96A]/10 blur-3xl rounded-full" />
                                <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                    <Image
                                        src="/CEO Myne.jpg.jpeg"
                                        alt="Myne Wilfred, Founder & CEO"
                                        fill
                                        className="object-cover object-top"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-[2rem] shadow-2xl hidden sm:block">
                                    <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.3em] mb-1">Distinguished</p>
                                    <p className="text-[#0B1F3A] font-serif text-lg leading-tight">Two decades of mastery</p>
                                </div>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="fade-in-up" delay={150}>
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] leading-tight">
                                    Dr. Myne Wilfred
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-[#0B1F3A] text-white border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">Founder &amp; President</Badge>
                                    <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">Hospitality Strategist</Badge>
                                    <Badge className="bg-slate-100 text-slate-700 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">Executive Leader</Badge>
                                    <Badge className="bg-slate-100 text-slate-700 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">Industry Authority</Badge>
                                </div>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                    A distinguished hospitality specialist, executive leader, and strategist with over two decades of experience in hospitality, business innovation, and high-level management. Her leadership philosophy is rooted in discipline, excellence, and the relentless pursuit of global standards.
                                </p>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                    As Founder and Chief Executive Officer of Ashford &amp; Gray Fusion Academy, Dr. Wilfred has built an institution where excellence is not aspirational — it is foundational. Under her stewardship, the Academy has become a global ecosystem where mastery, character, and refinement converge to shape the next generation of distinguished professionals.
                                </p>
                                <blockquote className="border-l-4 border-[#C8A96A] pl-6 py-2 italic text-lg md:text-xl text-[#0B1F3A] font-serif">
                                    "True luxury is not excess — it is precision, discipline, and excellence expressed effortlessly."
                                </blockquote>
                                <div className="pt-4">
                                    <Button asChild className="h-14 px-8 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full">
                                        <Link href="/about">Read the Founder's Philosophy</Link>
                                    </Button>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Faculty composition (abstract / coming-soon) */}
            <section className="py-24 md:py-32 bg-slate-50">
                <div className="container px-6 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
                            <span className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.4em]">Faculty &amp; Specialists</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A]">Faculty &amp; Experts</h2>
                        <p className="text-lg text-slate-500 mt-6 leading-relaxed font-medium">
                            Our faculty roster brings together industry practitioners, hospitality leaders, business strategists, and protocol experts who shape every programme with real-world authority.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        <Card className="border-none bg-white rounded-[2.5rem] p-10 text-center">
                            <CardContent className="p-0 space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0B1F3A]/5 flex items-center justify-center">
                                    <span className="text-[#0B1F3A] font-serif text-2xl">01</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Guest Lecturers</p>
                                <h3 className="text-xl md:text-2xl font-serif text-[#0B1F3A] leading-tight">Industry Voices</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Senior hospitality, business, and protocol leaders join us each cohort to deliver master sessions drawn from active practice.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-white rounded-[2.5rem] p-10 text-center">
                            <CardContent className="p-0 space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C8A96A]/10 flex items-center justify-center">
                                    <span className="text-[#C8A96A] font-serif text-2xl">02</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Industry Advisors</p>
                                <h3 className="text-xl md:text-2xl font-serif text-[#0B1F3A] leading-tight">Strategic Counsel</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Our advisory board steers curriculum alignment with global market demands and emerging industry standards.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-white rounded-[2.5rem] p-10 text-center">
                            <CardContent className="p-0 space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1F7A5A]/10 flex items-center justify-center">
                                    <span className="text-[#1F7A5A] font-serif text-2xl">03</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Resident Tutors</p>
                                <h3 className="text-xl md:text-2xl font-serif text-[#0B1F3A] leading-tight">Programme Leaders</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Specialised tutors deliver the day-to-day rigour of each programme, blending coaching, assessment, and mentorship.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <p className="text-center text-sm text-slate-400 mt-12 italic">Detailed faculty profiles will be published as each cohort opens. To engage as a guest lecturer or advisor, contact our admissions office.</p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32">
                <div className="container px-6 lg:px-12 text-center">
                    <ScrollAnimation animation="fade-in-up">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#0B1F3A] tracking-tight mb-10">
                            Become Part of <span className="italic text-[#C8A96A]">The Standard.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild className="h-16 md:h-20 px-10 md:px-16 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.4em] rounded-full shadow-2xl">
                                <Link href="/login?view=signup">Apply for Admission</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16 md:h-20 px-10 md:px-16 border-slate-200 text-[#0B1F3A] hover:bg-slate-100 rounded-full font-black text-[10px] uppercase tracking-[0.4em]">
                                <Link href="/contact">Contact Faculty Office</Link>
                            </Button>
                        </div>
                    </ScrollAnimation>
                </div>
            </section>
        </div>
    );
}

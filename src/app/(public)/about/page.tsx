import { Card, CardContent } from "@/components/ui/card";
import { Goal, Eye, Heart, Lightbulb, ShieldCheck, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export const metadata = {
    title: "About — Ashford & Gray Fusion Academy",
    description: "An institution defined by distinction. Discover the philosophy, mission, vision, and values shaping the next generation of luxury hospitality and business leaders.",
};

export default function AboutPage() {
    const coreValues = [
        { name: "Excellence", icon: Sparkles, desc: "Unwavering commitment to the highest global standards." },
        { name: "Discipline", icon: ShieldCheck, desc: "Structure, intentionality, and consistent delivery." },
        { name: "Integrity", icon: Heart, desc: "A community built on trust, character, and authority." },
        { name: "Innovation", icon: Lightbulb, desc: "Pioneering new ways to learn and lead in business." },
        { name: "Professionalism", icon: Users, desc: "Precision, discretion, and refinement in every detail." },
    ];

    return (
        <div className="bg-white">
            {/* Top Banner */}
            <header className="py-24 md:py-32 bg-white text-center border-b border-slate-50">
                <div className="container px-6 lg:px-12">
                    <ScrollAnimation animation="fade-in-up">
                        <div className="inline-flex items-center gap-3 mb-8">
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">About the Academy</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#C8A96A]" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-[#0B1F3A] tracking-tight leading-tight max-w-4xl mx-auto">
                            About Ashford &amp; Gray <br />
                            <span className="text-[#C8A96A]">Fusion Academy.</span>
                        </h1>
                    </ScrollAnimation>
                </div>
            </header>

            {/* Body Copy */}
            <section className="py-24 md:py-32 container px-6 lg:px-12">
                <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start">
                    <ScrollAnimation animation="fade-in">
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5]">
                            <Image
                                src="/student-library-writing.jpg"
                                alt="An Ashford & Gray scholar at study"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fade-in-up" delay={150}>
                        <div className="space-y-6 text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                            <p>
                                Ashford and Gray Fusion Academy is more than an institution; it is a global ecosystem where professional mastery meets academic authority. As a specialised academy dedicated to hospitality management, business innovation, and executive leadership, we are committed to developing high-level professionals equipped to thrive in a rapidly evolving global landscape.
                            </p>
                            <p>
                                Founded on the principle that excellence is never accidental, the Academy was built on a culture of structure, intentionality, discipline, and consistent delivery. We believe true leadership and service distinction are cultivated through a deliberate blend of knowledge, character, innovation, and practical execution.
                            </p>
                            <p>
                                Our educational philosophy combines the rigour of traditional scholarship with the agility of modern industry practices, creating a dynamic learning environment that is both intellectually grounded and professionally relevant. Through carefully designed programmes, executive-focused training, and industry-aligned learning models, we prepare individuals not only to succeed in their careers, but to lead with confidence, precision, and global relevance.
                            </p>
                            <p>
                                At Ashford and Gray Fusion Academy, we are shaping a new generation of professionals who understand that luxury, leadership, business, and service excellence are interconnected pillars of sustainable impact. Our commitment extends beyond certification; we are building a legacy-driven institution where competence meets class, innovation meets integrity, and education becomes a catalyst for transformation.
                            </p>
                        </div>
                    </ScrollAnimation>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 md:py-32 bg-slate-50">
                <div className="container px-6 lg:px-12 grid lg:grid-cols-2 gap-8 md:gap-12">
                    <ScrollAnimation animation="fade-in-up">
                        <Card className="border-none bg-white rounded-[3rem] shadow-sm h-full">
                            <CardContent className="p-10 md:p-14 space-y-6">
                                <div className="w-16 h-16 bg-[#C8A96A]/10 rounded-2xl flex items-center justify-center text-[#C8A96A]">
                                    <Goal className="w-7 h-7" />
                                </div>
                                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.4em]">Mission</p>
                                <h3 className="text-3xl md:text-4xl font-serif text-[#0B1F3A] leading-tight">Excellence as standard.</h3>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                    To develop a disciplined and elite community of globally relevant professionals by delivering practical, industry-led education that combines executive-level insight, professional authority, and international standards of excellence — empowering graduates to lead with competence, innovation, and distinction across diverse industries.
                                </p>
                            </CardContent>
                        </Card>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fade-in-up" delay={150}>
                        <Card className="border-none bg-[#0B1F3A] text-white rounded-[3rem] shadow-2xl h-full overflow-hidden relative">
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8A96A]/10 rounded-full blur-3xl" />
                            <CardContent className="p-10 md:p-14 space-y-6 relative">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#C8A96A]">
                                    <Eye className="w-7 h-7" />
                                </div>
                                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.4em]">Vision</p>
                                <h3 className="text-3xl md:text-4xl font-serif leading-tight">A global institution of consequence.</h3>
                                <p className="text-base md:text-lg text-slate-300 leading-relaxed font-medium">
                                    To become the world's leading and most recognised institution for hospitality, business innovation, and professional transformation — developing distinguished graduates equipped with the knowledge, leadership capacity, and global competence to excel, innovate, and lead across international markets.
                                </p>
                            </CardContent>
                        </Card>
                    </ScrollAnimation>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container px-6 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
                            <span className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.4em]">Core Values</span>
                            <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#0B1F3A]">The principles we live by</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
                        {coreValues.map((v, idx) => (
                            <ScrollAnimation key={v.name} animation="fade-in-up" delay={idx * 80}>
                                <div className="bg-slate-50 rounded-[2rem] p-8 h-full text-center hover:bg-[#0B1F3A] hover:text-white group transition-colors duration-500">
                                    <div className="w-14 h-14 mx-auto bg-white rounded-2xl flex items-center justify-center text-[#0B1F3A] group-hover:bg-[#C8A96A] group-hover:text-white transition-colors mb-6 shadow-sm">
                                        <v.icon className="w-6 h-6" />
                                    </div>
                                    <p className="font-serif text-lg md:text-xl text-[#0B1F3A] group-hover:text-white mb-3">{v.name}</p>
                                    <p className="text-xs md:text-sm text-slate-500 group-hover:text-slate-300 font-medium leading-relaxed">{v.desc}</p>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32 bg-slate-50">
                <div className="container px-6 lg:px-12 text-center">
                    <ScrollAnimation animation="fade-in-up">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#0B1F3A] tracking-tight mb-10">
                            Begin Your <span className="text-[#C8A96A]">Transformation.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild className="h-16 md:h-20 px-10 md:px-16 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.4em] rounded-full shadow-2xl">
                                <Link href="/login?view=signup">Apply for Admission</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16 md:h-20 px-10 md:px-16 border-slate-200 text-[#0B1F3A] hover:bg-slate-100 rounded-full font-black text-[10px] uppercase tracking-[0.4em]">
                                <Link href="/contact">Speak to an Advisor</Link>
                            </Button>
                        </div>
                    </ScrollAnimation>
                </div>
            </section>
        </div>
    );
}

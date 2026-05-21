import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight, BookOpen, Clock, Award, Briefcase, GraduationCap, Target, Users, Star, CheckCircle2,
} from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";

type RouteProps = { params: Promise<{ id: string }> };

async function loadCourse(id: string) {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
    await dbConnect();
    const course = await Course.findById(id).lean();
    if (!course) return null;
    if ((course as any).status && (course as any).status !== 'published') return null;
    return JSON.parse(JSON.stringify(course));
}

export async function generateMetadata({ params }: RouteProps) {
    const { id } = await params;
    const course = await loadCourse(id);
    if (!course) return { title: 'Course not found — Ashford & Gray' };
    return {
        title: `${course.title} — Ashford & Gray Fusion Academy`,
        description: course.description?.slice(0, 160) || 'A signature programme from Ashford & Gray Fusion Academy.',
    };
}

export default async function CourseDetailPage({ params }: RouteProps) {
    const { id } = await params;
    const course = await loadCourse(id);
    if (!course) notFound();

    const hasWhoFor = Array.isArray(course.whoFor) && course.whoFor.length > 0;
    const hasOutcomes = Array.isArray(course.learningOutcomes) && course.learningOutcomes.length > 0;
    const hasCertification = Array.isArray(course.certificationDetails) && course.certificationDetails.length > 0;
    const hasCareer = Array.isArray(course.careerOpportunities) && course.careerOpportunities.length > 0;
    const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];

    return (
        <div className="bg-white">
            {/* Hero */}
            <header className="relative bg-[#0B1F3A] text-white py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A96A]/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                </div>
                <div className="container px-6 lg:px-12 relative z-10">
                    <Link href="/courses" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] inline-flex items-center gap-2 mb-8 hover:gap-3 transition-all">
                        ← Back to Programmes
                    </Link>
                    <div className="grid lg:grid-cols-[1fr_400px] gap-12 md:gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-[#C8A96A]/20 text-[#C8A96A] border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">{course.category}</Badge>
                                <Badge className="bg-white/10 text-white border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">{course.level}</Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-2xl">
                                {course.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#C8A96A]" /> {course.duration} weeks</span>
                                <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#C8A96A]" /> {course.level}</span>
                                {course.instructor?.name && (
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#C8A96A]" /> {course.instructor.name}</span>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button asChild className="h-16 px-10 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-2xl">
                                    <Link href={`/login?view=signup&redirectUrl=${encodeURIComponent('/courses?dialog=' + id)}`}>Apply Now <ArrowRight className="ml-3 w-4 h-4" /></Link>
                                </Button>
                                <Button asChild variant="outline" className="h-16 px-10 border-white/20 text-white hover:bg-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.3em]">
                                    <Link href="/contact">Speak to an Advisor</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                                <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Body sections */}
            <div className="container px-6 lg:px-12 py-24 md:py-32 grid lg:grid-cols-[1fr_360px] gap-16">
                <div className="space-y-20">
                    <Section label="Overview" icon={Target}>
                        <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                            {course.description}
                        </p>
                    </Section>

                    {hasWhoFor && (
                        <Section label="Who This Is For" icon={Users}>
                            <ul className="space-y-3">
                                {course.whoFor.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#1F7A5A] shrink-0 mt-0.5" />
                                        <span className="text-base text-slate-600 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {hasOutcomes ? (
                        <Section label="What You Will Learn" icon={BookOpen}>
                            <div className="space-y-8">
                                {course.learningOutcomes.map((m: any, i: number) => (
                                    <div key={i} className="bg-slate-50 rounded-[2rem] p-8">
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="w-9 h-9 rounded-full bg-[#0B1F3A] text-[#C8A96A] font-black text-xs flex items-center justify-center">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <h4 className="font-serif text-xl text-[#0B1F3A]">{m.module}</h4>
                                        </div>
                                        <ul className="grid sm:grid-cols-2 gap-2 pl-12">
                                            {(m.topics || []).map((topic: string, j: number) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                    <span className="text-[#C8A96A] mt-1">•</span>
                                                    <span>{topic}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    ) : curriculum.length > 0 && (
                        <Section label="What You Will Learn" icon={BookOpen}>
                            <ul className="grid sm:grid-cols-2 gap-3">
                                {curriculum.map((topic: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-base text-slate-600 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-[#1F7A5A] shrink-0 mt-1" />
                                        <span>{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    <Section label="Duration" icon={Clock}>
                        <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed">
                            This programme runs for <strong className="text-[#0B1F3A]">{course.duration} weeks</strong> at the standard {course.level.toLowerCase()} pace. Advanced executive tracks may extend duration depending on cohort.
                        </p>
                    </Section>

                    {hasCertification && (
                        <Section label="Certification" icon={Award}>
                            <ul className="space-y-3">
                                {course.certificationDetails.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Award className="w-5 h-5 text-[#C8A96A] shrink-0 mt-0.5" />
                                        <span className="text-base text-slate-600 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {hasCareer && (
                        <Section label="Career Opportunities" icon={Briefcase}>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {course.careerOpportunities.map((item: string, i: number) => (
                                    <div key={i} className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
                                        <Briefcase className="w-4 h-4 text-[#1F7A5A] shrink-0 mt-1" />
                                        <span className="text-sm text-slate-600 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Final CTA inline */}
                    <ScrollAnimation animation="fade-in-up">
                        <div className="bg-[#0B1F3A] text-white rounded-[3rem] p-10 md:p-14 text-center">
                            <h3 className="text-3xl md:text-4xl font-serif mb-4">
                                Ready to begin? <span className="italic text-[#C8A96A]">Apply today.</span>
                            </h3>
                            <p className="text-slate-300 font-medium mb-8 max-w-md mx-auto">
                                Take your place among the next cohort of distinguished professionals.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button asChild className="h-14 px-10 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-2xl">
                                    <Link href={`/login?view=signup&redirectUrl=${encodeURIComponent('/courses?dialog=' + id)}`}>Apply Now</Link>
                                </Button>
                                <Button asChild variant="outline" className="h-14 px-10 border-white/20 text-white hover:bg-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.3em]">
                                    <Link href="/contact">Contact Admissions</Link>
                                </Button>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>

                {/* Sidebar */}
                <aside className="lg:sticky lg:top-32 lg:self-start space-y-6">
                    <Card className="border-none bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                        <CardContent className="p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.3em] mb-2">Tuition</p>
                                <p className="text-4xl font-black text-[#0B1F3A]">{formatPrice(course.price, course.currency)}</p>
                            </div>
                            <div className="space-y-3 border-t border-slate-100 pt-6">
                                <Row label="Duration" value={`${course.duration} weeks`} />
                                <Row label="Level" value={course.level} />
                                <Row label="Format" value="100% online" />
                                <Row label="Category" value={course.category} />
                            </div>
                            <Button asChild className="w-full h-14 rounded-2xl bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
                                <Link href={`/login?view=signup&redirectUrl=${encodeURIComponent('/courses?dialog=' + id)}`}>Apply for Admission</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {course.instructor?.name && (
                        <Card className="border-none bg-slate-50 rounded-[2.5rem] shadow-sm">
                            <CardContent className="p-8 space-y-4">
                                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.3em]">Programme Lead</p>
                                <div className="flex items-center gap-4">
                                    {course.instructor.avatarUrl && (
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0">
                                            <Image src={course.instructor.avatarUrl} alt={course.instructor.name} width={56} height={56} className="object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-serif text-lg text-[#0B1F3A] leading-tight">{course.instructor.name}</p>
                                        {course.instructor.verified && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#1F7A5A] uppercase tracking-widest mt-1">
                                                <CheckCircle2 className="w-3 h-3" /> Verified faculty
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </aside>
            </div>
        </div>
    );
}

function Section({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <ScrollAnimation animation="fade-in-up">
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0B1F3A]/5 text-[#0B1F3A] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif text-[#0B1F3A]">{label}</h2>
                </div>
                {children}
            </section>
        </ScrollAnimation>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-[#0B1F3A] text-right">{value}</span>
        </div>
    );
}

function formatPrice(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency || ''} ${amount.toLocaleString()}`;
    }
}

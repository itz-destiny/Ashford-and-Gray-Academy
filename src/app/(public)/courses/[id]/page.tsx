import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight, BookOpen, Clock, Award, Briefcase, GraduationCap, Target, Users, Star, CheckCircle2, ShieldCheck, PlayCircle, Trophy, FileText, ChevronRight
} from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import { STATIC_COURSES } from "@/lib/courses-data";
import { BrochureButton } from "./brochure-button";

type RouteProps = { params: Promise<{ id: string }> };

async function loadCourse(id: string) {
    const staticCourse = STATIC_COURSES.find(c => c.id === id);
    if (staticCourse) {
        return JSON.parse(JSON.stringify(staticCourse));
    }
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
    try {
        await dbConnect();
        const course = await Course.findById(id).lean();
        if (!course) return null;
        if ((course as any).status && (course as any).status !== 'published') return null;
        return JSON.parse(JSON.stringify(course));
    } catch (e) {
        console.warn("Database error in course detail page. Gracefully using static content fallback if available.");
        return null;
    }
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
        <div className="bg-[#FAF9F6] min-h-screen text-[#0B1F3A]">
            {/* HBS-Style Top Breadcrumb Header */}
            <div className="bg-[#0B1F3A] border-b border-white/5 py-4">
                <div className="container px-6 lg:px-12 mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A96A]">
                    <Link href="/courses" className="hover:text-white flex items-center gap-1.5 transition-colors">
                        ← Academic Programs
                    </Link>
                    <span className="text-white/40 hidden sm:inline">Global Leader in Elite Hospitality &amp; Business Curricula</span>
                </div>
            </div>

            {/* HBS Flagship Hero Header */}
            <header className="relative bg-[#0B1F3A] text-white py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C8A96A] rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />
                </div>
                
                <div className="container px-6 lg:px-12 mx-auto relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-8 space-y-8">
                            <ScrollAnimation animation="fade-in-up">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="bg-[#C8A96A] text-[#0B1F3A] border-none font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-none">
                                        {course.category}
                                    </Badge>
                                    <span className="text-white/20">•</span>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Next Cohort Enrolling</span>
                                </div>
                            </ScrollAnimation>

                            <ScrollAnimation animation="fade-in-up" delay={100}>
                                <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-[1.05] text-white max-w-4xl">
                                    {course.title}
                                </h1>
                            </ScrollAnimation>

                            <ScrollAnimation animation="fade-in-up" delay={200}>
                                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-3xl">
                                    {course.description}
                                </p>
                            </ScrollAnimation>

                            {/* HBS Core Highlights Stats Row */}
                            <ScrollAnimation animation="fade-in-up" delay={300}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10 text-left">
                                    <div>
                                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">Duration</p>
                                        <p className="text-lg font-bold text-white">{course.duration} Weeks</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Intense Executive Pace</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">Format</p>
                                        <p className="text-lg font-bold text-white">Fully Online</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Global Learning Network</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">Credentials</p>
                                        <p className="text-lg font-bold text-white">{course.category}</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Gold Standard Certificate</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">Next Intake</p>
                                        <p className="text-lg font-bold text-emerald-400">Admissions Open</p>
                                        <p className="text-[9px] text-white/40 mt-0.5">Rolling Selection</p>
                                    </div>
                                </div>
                            </ScrollAnimation>

                            <ScrollAnimation animation="fade-in-up" delay={400} className="pt-6 flex flex-col sm:flex-row gap-4">
                                <Button asChild className="h-16 px-10 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-none border-none shadow-none">
                                    <Link href={`/login?view=signup&redirectUrl=${encodeURIComponent('/courses?dialog=' + id)}`}>Apply Now <ArrowRight className="ml-3 w-4.5 h-4.5" /></Link>
                                </Button>
                                <Button asChild className="h-16 px-10 border border-white/20 bg-transparent text-white hover:bg-white/10 rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-none">
                                    <Link href="/contact">Speak to an Advisor</Link>
                                </Button>
                            </ScrollAnimation>
                        </div>
                        
                        <div className="lg:col-span-4 hidden lg:block">
                            <ScrollAnimation animation="fade-in" delay={300}>
                                <div className="relative aspect-[3/4] w-full max-w-sm mx-auto border-[10px] border-[#061222] shadow-2xl overflow-hidden group">
                                    <Image src={course.imageUrl} alt={course.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-[#C8A96A]/10 mix-blend-multiply" />
                                </div>
                            </ScrollAnimation>
                        </div>
                    </div>
                </div>
            </header>

            {/* HBS Style Sticky Sub-Navigation Tab Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm hidden md:block">
                <div className="container px-6 lg:px-12 mx-auto flex gap-12 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0B1F3A]">
                    <a href="#overview" className="py-6 border-b-2 border-[#C8A96A] text-[#C8A96A] hover:text-[#C8A96A] transition-colors">Overview</a>
                    <a href="#experience" className="py-6 border-b-2 border-transparent hover:border-[#1F7A5A] hover:text-[#1F7A5A] transition-colors">Academic Experience</a>
                    <a href="#curriculum" className="py-6 border-b-2 border-transparent hover:border-[#1F7A5A] hover:text-[#1F7A5A] transition-colors">Curriculum Modules</a>
                    <a href="#admissions" className="py-6 border-b-2 border-transparent hover:border-[#1F7A5A] hover:text-[#1F7A5A] transition-colors">Tuition &amp; Aid</a>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container px-6 lg:px-12 mx-auto py-20 md:py-28 space-y-24">
                
                {/* 1. Overview Section */}
                <section id="overview" className="scroll-mt-36">
                    <div className="max-w-4xl space-y-8">
                        <div className="inline-flex items-center gap-3">
                            <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Program Overview</span>
                            <span className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full"></span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-headline font-bold text-[#0B1F3A] tracking-tighter leading-none">
                            General Management Curriculum Focused on Real-World Practice.
                        </h2>
                        <p className="text-base md:text-lg text-[#0B1F3A]/75 leading-relaxed font-medium whitespace-pre-line border-l-4 border-[#C8A96A] pl-8">
                            {course.description}
                        </p>
                    </div>
                </section>

                {/* 2. Core Experience Grid (HBS Style Rectangular Cards) */}
                <section id="experience" className="scroll-mt-36 space-y-16">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Box 1: The Case Methodology */}
                        <ScrollAnimation animation="fade-in-up">
                            <div className="bg-white border border-slate-200 border-t-4 border-t-[#C8A96A] p-8 h-full space-y-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-[#1F7A5A]/5 flex items-center justify-center text-[#1F7A5A]">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="font-serif text-lg font-bold text-[#0B1F3A]">The Practice Method</h3>
                                <p className="text-xs text-[#0B1F3A]/70 leading-relaxed font-medium">
                                    At Ashford &amp; Gray, you don't merely read about management; you step into the role of a decision-maker, analyzing complex corporate and hospitality challenges in real time.
                                </p>
                                <ul className="space-y-2 border-t border-slate-100 pt-4 text-[11px] font-bold text-[#0B1F3A]/60">
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> High-pressure operations</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> Case discussions</li>
                                </ul>
                            </div>
                        </ScrollAnimation>

                        {/* Box 2: Class & Cohort Profile */}
                        <ScrollAnimation animation="fade-in-up" delay={100}>
                            <div className="bg-white border border-slate-200 border-t-4 border-t-[#C8A96A] p-8 h-full space-y-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-[#1F7A5A]/5 flex items-center justify-center text-[#1F7A5A]">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="font-serif text-lg font-bold text-[#0B1F3A]">Cohort Profile</h3>
                                <p className="text-xs text-[#0B1F3A]/70 leading-relaxed font-medium">
                                    Learn alongside high-caliber, disciplined professionals selected from diverse premium industries. Together, you form a collaborative learning network that endures.
                                </p>
                                <ul className="space-y-2 border-t border-slate-100 pt-4 text-[11px] font-bold text-[#0B1F3A]/60">
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> Max 25 select peers</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> Senior executive network</li>
                                </ul>
                            </div>
                        </ScrollAnimation>

                        {/* Box 3: Career Placements */}
                        <ScrollAnimation animation="fade-in-up" delay={200}>
                            <div className="bg-white border border-slate-200 border-t-4 border-t-[#C8A96A] p-8 h-full space-y-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-[#1F7A5A]/5 flex items-center justify-center text-[#1F7A5A]">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h3 className="font-serif text-lg font-bold text-[#0B1F3A]">Career Impact</h3>
                                <p className="text-xs text-[#0B1F3A]/70 leading-relaxed font-medium">
                                    Our graduates enter the market with a refined executive presence and practical authority, immediately qualifying for placements with elite brands and hospitality estates.
                                </p>
                                <ul className="space-y-2 border-t border-slate-100 pt-4 text-[11px] font-bold text-[#0B1F3A]/60">
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> Global alumni registry</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> Corporate placement desks</li>
                                </ul>
                            </div>
                        </ScrollAnimation>

                        {/* Box 4: Global Distinction */}
                        <ScrollAnimation animation="fade-in-up" delay={300}>
                            <div className="bg-white border border-slate-200 border-t-4 border-t-[#C8A96A] p-8 h-full space-y-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-[#1F7A5A]/5 flex items-center justify-center text-[#1F7A5A]">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h3 className="font-serif text-lg font-bold text-[#0B1F3A]">Ivy Accreditation</h3>
                                <p className="text-xs text-[#0B1F3A]/70 leading-relaxed font-medium">
                                    Receiving an Ashford &amp; Gray diploma is a mark of absolute distinction. Each certificate is backed by robust, verified academic rigor and executive authority.
                                </p>
                                <ul className="space-y-2 border-t border-slate-100 pt-4 text-[11px] font-bold text-[#0B1F3A]/60">
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> Lifetime credentials</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-[#C8A96A]" /> Globally recognised certification</li>
                                </ul>
                            </div>
                        </ScrollAnimation>
                    </div>
                </section>

                {/* 3. Who This is For */}
                {hasWhoFor && (
                    <section className="py-12 border-t border-slate-200">
                        <div className="grid lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-4 space-y-4">
                                <div className="inline-flex items-center gap-3">
                                    <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Candidate Profile</span>
                                </div>
                                <h3 className="text-2xl font-serif text-[#0B1F3A] leading-tight">Who We Are Looking For.</h3>
                                <p className="text-xs text-[#0B1F3A]/60 leading-relaxed font-semibold">
                                    Selection is based on professional drive, willingness to adapt to premium service disciplines, and analytical leadership potential.
                                </p>
                            </div>
                            <div className="lg:col-span-8 bg-white border border-slate-100 p-8 rounded-none shadow-sm">
                                <ul className="grid sm:grid-cols-2 gap-4">
                                    {course.whoFor.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-[#1F7A5A] shrink-0 mt-0.5" />
                                            <span className="text-sm text-[#0B1F3A]/80 font-bold leading-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. Curriculum Modules Section */}
                <section id="curriculum" className="scroll-mt-36 pt-16 border-t border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3">
                                <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Academic Syllabus</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-headline font-bold text-[#0B1F3A] tracking-tighter">
                                Dynamic Learning Syllabus
                            </h2>
                            <p className="text-[#0B1F3A]/60 text-xs font-black uppercase tracking-widest">
                                {curriculum.length || course.learningOutcomes?.length || 0} Modules • {course.duration * 4} Lecture Hours
                            </p>
                        </div>
                        <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest text-[#0B1F3A] border-slate-200 px-6 h-12 rounded-none hover:bg-slate-50">
                            Download Syllabus PDF
                        </Button>
                    </div>

                    {hasOutcomes ? (
                        <div className="grid gap-6">
                            {course.learningOutcomes.map((m: any, i: number) => (
                                <ScrollAnimation key={i} animation="fade-in-up" delay={i * 50}>
                                    <div className="bg-white border border-slate-200 border-l-4 border-l-[#C8A96A] p-8 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="w-8 h-8 rounded-none bg-[#0B1F3A] text-[#C8A96A] font-black text-xs flex items-center justify-center shrink-0">
                                                0{i + 1}
                                            </span>
                                            <h4 className="font-serif text-lg md:text-xl text-[#0B1F3A] font-bold">{m.module}</h4>
                                        </div>
                                        <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-3 pl-12">
                                            {(m.topics || []).map((topic: string, j: number) => (
                                                <li key={j} className="flex items-start gap-2.5 text-xs text-[#0B1F3A]/75 font-semibold">
                                                    <span className="text-[#C8A96A] mt-0.5 font-bold">•</span>
                                                    <span>{topic}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </ScrollAnimation>
                            ))}
                        </div>
                    ) : curriculum.length > 0 && (
                        <div className="bg-white border border-slate-200 p-8">
                            <ul className="grid sm:grid-cols-2 gap-4">
                                {curriculum.map((topic: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-[#0B1F3A]/80 font-bold">
                                        <CheckCircle2 className="w-4.5 h-4.5 text-[#1F7A5A] shrink-0 mt-0.5" />
                                        <span>{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* 5. Admissions & Financial Investment Section */}
                <section id="admissions" className="scroll-mt-36 pt-16 border-t border-slate-200">
                    <div className="grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="inline-flex items-center gap-3">
                                <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Registry &amp; Funding</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-headline font-bold text-[#0B1F3A] tracking-tighter">
                                Tuition &amp; <br />Financial Support
                            </h2>
                            <p className="text-sm text-[#0B1F3A]/70 leading-relaxed font-semibold">
                                We are committed to executive access and affordability. Our Registry operates need-based installment structures and accepts verified corporate sponsor packages.
                            </p>
                        </div>
                        <div className="lg:col-span-7 space-y-6">
                            <Card className="border-none bg-white rounded-none shadow-sm border border-slate-200">
                                <CardContent className="p-8 md:p-12 space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tuition Investment</p>
                                            <p className="text-4xl font-serif font-black text-[#0B1F3A]">₦{course.price.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <Badge className="bg-[#1F7A5A]/10 text-[#1F7A5A] border-none font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-none">
                                                All-Inclusive Registry Fee
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs font-semibold">
                                            <span className="text-slate-400">Duration</span>
                                            <span className="text-[#0B1F3A] font-bold">{course.duration} weeks</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-semibold">
                                            <span className="text-slate-400">Level Accreditation</span>
                                            <span className="text-[#0B1F3A] font-bold">{course.level} Distinction</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-semibold">
                                            <span className="text-slate-400">Delivery Format</span>
                                            <span className="text-[#0B1F3A] font-bold">100% Online with Live Seminars</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-semibold">
                                            <span className="text-slate-400">Study Materials &amp; Cases</span>
                                            <span className="text-emerald-600 font-bold">Included</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <Button asChild className="w-full h-16 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-none shadow-none border-none">
                                            <Link href={`/login?view=signup&redirectUrl=${encodeURIComponent('/courses?dialog=' + id)}`}>Begin Online Application</Link>
                                        </Button>
                                        <BrochureButton courseId={id} courseTitle={course.title} />
                                        <p className="text-[10px] text-slate-400 font-medium text-center pt-1">
                                            Brochure download is reserved for registered candidates.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* 6. Certification Deliverables (HBS Showcase Block) */}
                {hasCertification && (
                    <section className="py-16 border-t border-slate-200">
                        <div className="bg-[#0B1F3A] text-white p-12 md:p-20 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C8A96A] rounded-full blur-3xl" />
                            </div>
                            <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="inline-flex items-center gap-3">
                                        <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Accreditation Badge</span>
                                    </div>
                                    <h3 className="text-3xl font-serif text-white tracking-tight leading-tight">
                                        Gold-Standard Institutional Credentials.
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                                        Upon successful completion of the coursework, practical cases, and the registry audit, you will receive official, internationally recognized certification.
                                    </p>
                                </div>
                                <div className="lg:col-span-7 border-l border-white/10 pl-0 lg:pl-12 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A96A] mb-4">Official Deliverables:</h4>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {course.certificationDetails.map((item: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Award className="w-5 h-5 text-[#C8A96A] shrink-0 mt-0.5" />
                                                <span className="text-xs text-slate-300 font-bold leading-snug">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Final CTA Showcase (HBS closing application) */}
                <section className="pt-20 border-t border-slate-200">
                    <ScrollAnimation animation="fade-in-up">
                        <div className="bg-[#0B1F3A] text-white rounded-none p-12 md:p-24 text-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-[120px]" />
                            </div>
                            <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                                <div className="inline-flex items-center gap-3">
                                    <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Admissions Open</span>
                                </div>
                                <h3 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-none">
                                    Blaze a New Trail.<br />
                                    <span className="text-[#C8A96A] font-serif font-normal">Command Respect.</span>
                                </h3>
                                <p className="text-slate-400 font-medium leading-relaxed max-w-xl mx-auto text-sm">
                                    Submit your credentials online to our Registry today and take your seat in the next distinguished cohort.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <Button asChild className="h-16 px-12 bg-[#C8A96A] hover:bg-[#B69859] text-[#0B1F3A] font-black text-[10px] uppercase tracking-[0.3em] rounded-none shadow-none border-none">
                                        <Link href={`/login?view=signup&redirectUrl=${encodeURIComponent('/courses?dialog=' + id)}`}>Apply Now</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-16 px-12 border-white/20 text-white hover:bg-white/10 rounded-none font-black text-[10px] uppercase tracking-[0.3em]">
                                        <Link href="/contact">Registry Support</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>
                </section>
            </div>
        </div>
    );
}

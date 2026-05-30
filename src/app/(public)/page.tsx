"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Star,
  Users,
  Palette,
  Briefcase,
  Code,
  Megaphone,
  BarChart,
  Camera,
  Music,
  Cpu,
  GraduationCap,
  Handshake,
  Wrench,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileText,
  Globe
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import type { Course } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { STATIC_COURSES } from "@/lib/courses-data";
import { ARTICLES } from "@/lib/insights-data";

export default function Home() {
  const [trendingCourses, setTrendingCourses] = React.useState<Course[]>(STATIC_COURSES.slice(0, 3));
  const [coursesLoading, setCoursesLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) {
          console.warn(`Fetch returned status: ${res.status}`);
          return;
        }
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          // Merge dynamic database courses while keeping static courses first
          const merged = [...STATIC_COURSES];
          data.forEach(dc => {
            if (!merged.some(mc => mc.id === dc.id || mc.title.toLowerCase() === dc.title.toLowerCase())) {
              merged.push(dc);
            }
          });
          setTrendingCourses(merged.slice(0, 3));
        }
      } catch (error) {
        console.warn('Silent fallback on dynamic courses fetch:', error);
      } finally {
        if (active) setCoursesLoading(false);
      }
    };

    // Delay slightly to shield against hot-reloads and HMR compiler timeouts
    const timer = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen text-[#0B1F3A] font-body selection:bg-[#C8A96A] selection:text-[#0B1F3A]">
      {/* 1. HBS-Style HERO SECTION: Editorial Ivory Layout with Gold Top Border */}
      <section className="relative bg-[#F6F4F2] border-t-4 border-[#C8A96A] py-16 md:py-32 overflow-hidden">
        {/* Subtle decorative background watermark using brand crest initials */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
          <span className="text-[30vw] font-serif font-black tracking-tighter text-[#0B1F3A]">AG</span>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8">
              <ScrollAnimation animation="fade-in-up" delay={100}>
                <div className="inline-flex items-center gap-3">
                  <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em] font-body">Ashford & Gray Academy</span>
                  <span className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full"></span>
                  <span className="text-[#0B1F3A]/60 text-xs font-semibold uppercase tracking-[0.2em]">Est. 2024</span>
                </div>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-in-up" delay={200}>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-headline font-bold tracking-tighter leading-[0.95] text-[#0B1F3A]">
                  Mastering Luxury. <br />
                  <span className="italic font-serif font-normal text-[#C8A96A] tracking-normal">Elevating Business.</span>
                </h1>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-in-up" delay={250}>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold text-[#0B1F3A]/90 tracking-tight leading-snug">
                  Where Excellence is Refined, and Leaders are Distinct.
                </h2>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-in-up" delay={300}>
                <p className="text-lg sm:text-xl text-[#0B1F3A]/75 font-body font-normal leading-relaxed max-w-2xl">
                  A global institution shaping elite professionals in hospitality, business, and innovation.
                </p>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-in-up" delay={400} className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 rounded-none bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-extrabold text-xs uppercase tracking-widest transition-all shadow-none border-none animate-fade-in"
                    asChild
                  >
                    <Link href="/login?view=signup">Apply for Admission</Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-8 rounded-none border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white font-extrabold text-xs uppercase tracking-widest transition-all bg-transparent"
                    asChild
                  >
                    <Link href="/courses">Explore Programs</Link>
                  </Button>
                </div>
              </ScrollAnimation>
            </div>

            {/* Right Hero Image Column (Grid & Editorial frame) */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <ScrollAnimation animation="scale-up" delay={300}>
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto border-8 border-white shadow-xl overflow-hidden group">
                  <Image
                    src="/cohort-global-vision.jpg"
                    alt="Ashford & Gray Global Seminar Cohort"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C8A96A] bg-white inline-block px-2.5 py-1">Featured Cohort</p>
                    <h3 className="font-serif text-lg font-bold leading-tight">Shaping the next generation of global strategic leaders.</h3>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE HBS "RESEARCH & IDEAS" EDITORIAL PORTAL */}
      <section className="py-20 md:py-28 bg-white border-y border-slate-200">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#1F7A5A] text-xs font-black uppercase tracking-[0.2em]">
                <TrendingUp className="w-4 h-4" />
                <span>Research & Insights</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-[#0B1F3A] leading-none">Global Business Insights</h2>
            </div>
            <Link
              href="/insights"
              className="text-[#1F7A5A] hover:text-[#0B1F3A] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors mt-4 md:mt-0"
            >
              <span>View All Research</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Editorial Grid — articles by Myne Wilfred */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-14">
            {ARTICLES.map((insight, idx) => (
              <ScrollAnimation key={insight.slug} animation="fade-in-up" delay={idx * 100}>
                <Link href={`/insights/${insight.slug}`} className="block group space-y-4">
                  <div className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.25em]">{insight.category}</div>
                  <h3 className="font-serif text-2xl font-bold text-[#0B1F3A] leading-snug group-hover:text-[#1F7A5A] transition-colors duration-300">
                    {insight.title}
                  </h3>
                  <p className="text-sm md:text-base text-[#0B1F3A]/75 leading-relaxed font-medium line-clamp-3">{insight.excerpt}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-[#0B1F3A]/60 uppercase tracking-wider">
                    <span>{insight.author}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{insight.date}</span>
                      <span>•</span>
                      <span>{insight.readTime}</span>
                    </div>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE ACADEMIC PROGRAMS: The HBS Block Layout */}
      <section className="py-20 md:py-28 bg-[#F6F4F2]">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section title */}
          <div className="max-w-3xl mb-16 space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Signature Curricula</span>
              <span className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full"></span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-[#0B1F3A] leading-none">
              Elite Academic Programs
            </h2>
            <p className="text-[#0B1F3A]/75 text-base sm:text-lg font-medium max-w-xl">
              Immerse yourself in rigorous, field-tested curricula engineered by industry authorities to deliver rapid career distinction.
            </p>
          </div>

          {/* Program cards grid - HBS rectangular style with gold top border */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {coursesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 bg-white border-t-4 border-[#0B1F3A] animate-pulse" />
              ))
            ) : trendingCourses.length > 0 ? (
              trendingCourses.map((course, idx) => (
                <ScrollAnimation key={course.id} animation="fade-in-up" delay={idx * 100}>
                  <Link href="/courses" className="group block h-full">
                    <div className="bg-white border-t-4 border-[#0B1F3A] rounded-none shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                      {/* Image frame */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <Image
                          src={course.imageUrl}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-[#0B1F3A] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5">
                          {course.category}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <h3 className="font-serif text-2xl font-bold text-[#0B1F3A] group-hover:text-[#1F7A5A] transition-colors duration-300 leading-tight">
                            {course.title}
                          </h3>
                          <p className="text-xs text-[#0B1F3A]/70 leading-relaxed font-medium line-clamp-3">
                            {course.description || "Master executive skills, protocol management, and strategic frameworks under the direct instruction of industry veterans."}
                          </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#0B1F3A]">
                          <span className="text-[#C8A96A] font-extrabold">{course.duration || "12 Weeks"} Duration</span>
                          <span className="flex items-center gap-1.5 hover:text-[#1F7A5A] transition-colors">
                            <span>Explore Details</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollAnimation>
              ))
            ) : (
              // Fallback cards if database API is empty
              [
                { title: "Executive Luxury Hospitality Management", cat: "Hospitality" },
                { title: "Advanced Corporate Facilities & Strategy", cat: "Strategy" },
                { title: "Global Protocol, Concierge & Estate Leadership", cat: "Operations" }
              ].map((c, idx) => (
                <ScrollAnimation key={c.title} animation="fade-in-up" delay={idx * 100}>
                  <Link href="/courses" className="group block h-full">
                    <div className="bg-white border-t-4 border-[#0B1F3A] rounded-none shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                      <div className="p-8 flex-1 flex flex-col justify-between min-h-[300px]">
                        <div className="space-y-4">
                          <Badge className="bg-[#0B1F3A] text-white text-[8px] font-black uppercase tracking-widest rounded-none border-none py-1 px-2.5">{c.cat}</Badge>
                          <h3 className="font-serif text-2xl font-bold text-[#0B1F3A] group-hover:text-[#1F7A5A] transition-colors duration-300 leading-tight">
                            {c.title}
                          </h3>
                          <p className="text-xs text-[#0B1F3A]/70 leading-relaxed font-medium">
                            An elite, immersive program designed for high-potential professionals. Master strategic frameworks, service aesthetics, and luxury operational systems.
                          </p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#C8A96A]">
                          <span>12 Weeks • Executive</span>
                          <span className="flex items-center gap-1.5 text-[#0B1F3A] group-hover:text-[#1F7A5A] transition-colors font-extrabold">
                            <span>Explore Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollAnimation>
              ))
            )}
          </div>

          {/* Section footer CTA */}
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              className="h-12 px-8 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-extrabold text-xs uppercase tracking-widest transition-all border-none"
              asChild
            >
              <Link href="/courses">View All Academic Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. INSTITUTIONAL PILLARS (THE HBS STANDARD) */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2">
              <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">The Academy Standard</span>
              <span className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-[#0B1F3A] leading-none">
              Why Ashford &amp; Gray
            </h2>
            <p className="text-[#0B1F3A]/70 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Our educational framework sets an elite standard in high-end business administration, executive service, and global protocol.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: "Luxury Service Standard",
                desc: "Training rooted in excellence, discretion, discipline, and refined professional conduct.",
                icon: Star
              },
              {
                title: "Business Innovation Focus",
                desc: "Programmes designed to help learners think strategically and build sustainable enterprises.",
                icon: Briefcase
              },
              {
                title: "Executive Learning Experience",
                desc: "Structured for professionals, entrepreneurs, managers, and emerging leaders.",
                icon: GraduationCap
              },
              {
                title: "100% Online, Globally Accessible",
                desc: "Flexible learning without compromising standard, structure, or quality.",
                icon: Globe
              }
            ].map((pillar, idx) => (
              <ScrollAnimation key={pillar.title} animation="fade-in-up" delay={idx * 80}>
                <div className="p-8 bg-[#F6F4F2] border-t-2 border-[#0B1F3A]/10 h-full space-y-6 hover:border-[#C8A96A] transition-all duration-300">
                  <div className="text-[#C8A96A]">
                    <pillar.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-[#0B1F3A]">{pillar.title}</h3>
                    <p className="text-xs text-[#0B1F3A]/70 leading-relaxed font-medium">{pillar.desc}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Distinguished Career Outcomes Sub-section */}
          <div className="mt-20 pt-16 border-t border-slate-100">
            <h3 className="text-2xl font-serif font-bold text-[#0B1F3A] mb-12 text-center">Distinguished Career Outcomes</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
              {[
                { role: "Hospitality Leadership Roles", desc: "Command elite hotels, resorts, and operations globally." },
                { role: "Business Consulting & Strategy", desc: "Formulate institutional pathways and advisory solutions." },
                { role: "Event & Experience Management", desc: "Orchestrate high-profile corporate & VIP events." },
                { role: "Estate & Protocol Management", desc: "Direct luxury private residences and diplomatic affairs." },
                { role: "Entrepreneurship & Enterprise Development", desc: "Build high-growth modern luxury brands and services." }
              ].map((outcome, idx) => (
                <ScrollAnimation key={outcome.role} animation="fade-in-up" delay={idx * 50}>
                  <div className="bg-[#F6F4F2] p-8 text-center space-y-4 h-full border-t-2 border-[#C8A96A]/20 hover:border-[#C8A96A] transition-all flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#1F7A5A]/5 flex items-center justify-center mx-auto text-[#1F7A5A]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif text-sm font-bold text-[#0B1F3A] leading-tight flex-grow flex items-center justify-center">{outcome.role}</h4>
                    <p className="text-[10px] text-[#0B1F3A]/60 leading-snug">{outcome.desc}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEAN'S VISION STYLE SECTION: The Founder & CEO's Message in Signature Navy */}
      <section id="founder-address" className="py-20 md:py-32 bg-[#0B1F3A] text-white relative overflow-hidden">
        {/* Subtle background gold graphic */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C8A96A] rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Framed portrait on the left */}
            <div className="lg:col-span-5">
              <ScrollAnimation animation="fade-in" delay={150}>
                <div className="relative aspect-[3/4] w-full max-w-sm mx-auto border-[10px] border-[#061222] shadow-2xl overflow-hidden group">
                  <Image
                    src="/CEO.jpeg"
                    alt="Myne Wilfred, Founder & CEO"
                    fill
                    className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#C8A96A]/10 mix-blend-multiply" />
                </div>
              </ScrollAnimation>
            </div>

            {/* CEO Text on the right */}
            <div className="lg:col-span-7 space-y-8">
              <ScrollAnimation animation="fade-in-up">
                <div className="inline-flex items-center gap-3">
                  <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Executive Vision</span>
                  <span className="w-10 h-[1px] bg-white/20"></span>
                </div>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-in-up" delay={100}>
                <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter leading-[0.95] text-white">
                  Message from the <br />
                  <span className="italic font-serif font-normal text-[#C8A96A] tracking-normal">Founder &amp; CEO.</span>
                </h2>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-in-up" delay={200}>
                <div className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium space-y-6 border-t border-b border-white/5 py-6">
                  <p className="font-serif text-lg italic text-[#FAF9F6]">
                    "True luxury is not defined by excess; it is defined by discipline, precision, and excellence."
                  </p>
                  <p>
                    Welcome to Ashford & Gray Fusion Academy—an institution defined not by convention, but by distinction.
                  </p>
                  <p>
                    Ashford & Gray Fusion Academy was established with a singular vision: to create a learning environment where excellence is not aspirational, but foundational… where individuals are not merely trained, but transformed into authorities within their fields.
                  </p>
                  <p>
                    In a world that often settles for average, we are deliberate about setting an elite standard. Our Academy was founded to meet a significant global demand: the need for professionals who possess not only top-tier technical skills, but also the refined etiquette, executive presence, and strategic intelligence required to command respect in the highest circles.
                  </p>
                  <p>
                    Whether you are pursuing our housekeeping, hospitality, event management, or business programs, you are engaging with a curriculum designed to challenge, inspire, and elevate you. We do not teach theories; we teach mastery. We do not prepare you for jobs; we prepare you for legacy.
                  </p>
                  <p>
                    Our promise to you is absolute: if you bring the willingness to learn and the discipline to adapt, we will equip you to stand out, command authority, and make an indelible mark in your industry.
                  </p>
                  <p>
                    Step into a higher level of professional authority. Your legacy begins here.
                  </p>
                </div>
              </ScrollAnimation>

              <ScrollAnimation animation="fade-in-up" delay={300} className="pt-4">
                <div className="flex items-center gap-4">
                  <span className="h-[2px] w-12 bg-[#C8A96A]"></span>
                  <div>
                    <h4 className="font-serif text-xl font-bold tracking-tight text-white">Myne Wilfred</h4>
                    <p className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.3em] mt-1">Founder & Chief Executive Officer</p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLOSING CTA SECTION */}
      <section className="py-20 md:py-28 bg-[#FAF9F6] text-center border-t border-slate-200">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl space-y-8">
          <ScrollAnimation animation="fade-in-up">
            <div className="inline-block">
              <div className="flex items-center gap-3">
                <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em]">Admissions Open</span>
                <span className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full"></span>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-in-up" delay={100}>
            <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter text-[#0B1F3A] leading-none">
              Step into a <span className="text-[#C8A96A]">Higher Standard.</span>
            </h2>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-in-up" delay={200}>
            <p className="text-base sm:text-lg text-[#0B1F3A]/70 font-medium max-w-xl mx-auto">
              Join the next cohort of distinguished global leaders. Applications are reviewed on a rolling basis.
            </p>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-in-up" delay={300} className="pt-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-none bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-extrabold text-xs uppercase tracking-widest transition-all shadow-none border-none"
                asChild
              >
                <Link href="/login?view=signup">Apply for Admission</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-10 rounded-none border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white font-extrabold text-xs uppercase tracking-widest transition-all bg-transparent"
                asChild
              >
                <Link href="/contact">Speak to an Advisor</Link>
              </Button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}

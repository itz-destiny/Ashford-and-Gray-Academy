"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Award,
  CheckCircle2,
  BookOpen,
  Calendar
} from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import type { Course } from "@/lib/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STATIC_COURSES } from "@/lib/courses-data";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutDialog } from "@/components/checkout-dialog";

interface CurriculumCatalogProps {
  title: string;
  subtitle: string;
  badge: string;
  courseIds: string[];
}

export function CurriculumCatalog({ title, subtitle, badge, courseIds }: CurriculumCatalogProps) {
  const pathname = usePathname();
  const [courses, setCourses] = useState<Course[]>(STATIC_COURSES);
  const [searchQuery, setSearchQuery] = useState("");

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
        if (active) {
          const apiCourses = Array.isArray(data) ? data : [];
          const merged = [...STATIC_COURSES];
          apiCourses.forEach(ac => {
            if (!merged.some(mc => mc.id === ac.id || mc.title.toLowerCase() === ac.title.toLowerCase())) {
              merged.push(ac);
            }
          });
          setCourses(merged);
        }
      } catch (error) {
        console.warn('Silent fallback on dynamic courses catalog fetch:', error);
      }
    };

    const timer = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const filteredCourses = useMemo(() => {
    let subset = courses.filter(c => courseIds.includes(c.id));

    // Preserve the order callers passed in `courseIds` so the academy's
    // canonical progression (Certifications → Diplomas → Executive Master
    // Class) is honoured on the All Programs view.
    subset.sort((a, b) => courseIds.indexOf(a.id) - courseIds.indexOf(b.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      subset = subset.filter(course =>
        course.title.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q) ||
        course.level?.toLowerCase().includes(q)
      );
    }
    return subset;
  }, [courses, courseIds, searchQuery]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-32 text-[#0B1F3A]">

      {/* Enrolment checkout — opens when the URL carries ?dialog=<courseId> */}
      <CheckoutDialog courses={courses} />

      {/* Top Gold Border */}
      <div className="h-2 bg-[#C8A96A] w-full" />

      {/* Breadcrumb Bar */}
      <div className="bg-[#061222] text-white/50 text-[10px] font-bold uppercase tracking-widest py-5 border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Ashford &amp; Gray Academy</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <Link href="/academic-programs" className="hover:text-white transition-colors">Academic Programs</Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-white">{title}</span>
          </div>
          <span className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.2em] hidden md:inline">
            Board-Registered Credentials
          </span>
        </div>
      </div>

      {/* Majestic Flagship Hero Header */}
      <header className="relative py-24 md:py-32 px-6 overflow-hidden bg-[#0B1F3A] text-white">
        {/* Soft luxury gold blur */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-20">
          <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-[#C8A96A] rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto relative z-10 max-w-5xl space-y-8">
          <ScrollAnimation animation="fade-in-up">
            <div className="inline-flex items-center gap-3 px-5 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-none">
              <Sparkles className="w-4 h-4 text-[#C8A96A]" />
              <span className="text-[#C8A96A] font-black text-[9px] uppercase tracking-[0.4em]">{badge}</span>
            </div>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-in-up" delay={100}>
            <h1 className="text-4xl md:text-7xl font-serif text-white tracking-tight leading-[1.05] max-w-4xl">
              {title}
            </h1>
          </ScrollAnimation>
          
          <ScrollAnimation animation="fade-in-up" delay={200}>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed font-medium">
              {subtitle}
            </p>
          </ScrollAnimation>

          {/* HBS replica Stats Row */}
          <ScrollAnimation animation="fade-in-up" delay={300} className="pt-8 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              <div>
                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">ACCELERATION</p>
                <p className="text-base font-bold text-white">12 - 24 Weeks</p>
                <p className="text-[9px] text-white/40 mt-0.5">Executive Cadence</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">ACADEMIC FORMAT</p>
                <p className="text-base font-bold text-white">Fully Online</p>
                <p className="text-[9px] text-white/40 mt-0.5">Live Virtual Cohorts</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">REGISTRY DESK</p>
                <p className="text-base font-bold text-white">Authorized Credentials</p>
                <p className="text-[9px] text-white/40 mt-0.5">Gold-Standard Badge</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-[0.2em] mb-1">SELECTION</p>
                <p className="text-base font-bold text-emerald-400">Admissions Open</p>
                <p className="text-[9px] text-white/40 mt-0.5">Rolling Application</p>
              </div>
            </div>
          </ScrollAnimation>

          {/* Luxury Search Bar */}
          <ScrollAnimation animation="fade-in-up" delay={400} className="max-w-xl pt-4">
            <div className="relative bg-white p-1 rounded-none shadow-2xl transition-all border-none">
              <div className="flex items-center">
                <Search className="ml-5 h-5 w-5 text-slate-400 shrink-0" />
                <Input
                  placeholder="Filter curriculum or registered track..."
                  className="h-14 bg-transparent border-none text-[#0B1F3A] text-sm font-semibold focus-visible:ring-0 placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </header>

      {/* HBS Style Sticky Sub-Navigation Tab Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm hidden md:block">
        <div className="container px-6 lg:px-12 mx-auto flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">
          <Link href="/academic-programs" className={`py-6 border-b-2 transition-all ${pathname === '/academic-programs' ? 'border-[#C8A96A] text-[#C8A96A]' : 'border-transparent text-slate-500 hover:text-[#0B1F3A]'}`}>
            All Programs
          </Link>
          <Link href="/programs" className={`py-6 border-b-2 transition-all ${pathname === '/programs' ? 'border-[#C8A96A] text-[#C8A96A]' : 'border-transparent text-slate-500 hover:text-[#0B1F3A]'}`}>
            Degrees &amp; Diplomas
          </Link>
          <Link href="/executive" className={`py-6 border-b-2 transition-all ${pathname === '/executive' ? 'border-[#C8A96A] text-[#C8A96A]' : 'border-transparent text-slate-500 hover:text-[#0B1F3A]'}`}>
            Executive Education
          </Link>
          <Link href="/certifications" className={`py-6 border-b-2 transition-all ${pathname === '/certifications' ? 'border-[#C8A96A] text-[#C8A96A]' : 'border-transparent text-slate-500 hover:text-[#0B1F3A]'}`}>
            Professional Certifications
          </Link>
        </div>
      </div>

      {/* Brochure-Style Vertical Register */}
      <main className="container mx-auto px-6 lg:px-12 py-16 max-w-6xl">
        <div className="space-y-6 mb-12">
          <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.3em] block">
            Academic Register
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-none">
            Registered Curricula &amp; <span className="text-[#C8A96A]">Tracks</span>
          </h2>
          <p className="text-slate-500 text-sm font-semibold max-w-xl leading-relaxed">
            Submit your candidacy online to secure placement in the upcoming rolling enrollment.
          </p>
        </div>

        <div className="space-y-20">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, idx) => {
              const programFormat = "Online Classes";
              const targetLink = `/courses/${course.id}`;
              
              // Get dynamic modules showcase from course data
              const highlightTopics = course.whoFor?.slice(0, 4) || [
                "Strategic development coordination",
                "Advanced operational excellence systems",
                "Prestige service operations",
                "Global networking and relations"
              ];

              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="grid lg:grid-cols-12 gap-12 items-stretch py-16 border-b border-slate-200 hover:bg-[#FAF9F6] transition-colors"
                >
                  {/* Left: generated African luxury image with golden est badge */}
                  <div className="lg:col-span-5 relative flex flex-col justify-center min-h-[350px]">
                    <div className="relative w-full h-full min-h-[350px] border-[8px] border-[#0B1F3A] shadow-xl overflow-hidden group">
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[#0B1F3A]/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
                      

                    </div>
                  </div>

                  {/* Right: HBS Brochure details */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-[#C8A96A]/15 text-[#C8A96A] border-none font-bold text-[8px] uppercase tracking-widest px-3.5 py-1 rounded-none">
                          {course.category}
                        </Badge>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[9px] uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Admissions Open
                        </div>
                      </div>

                      <h3 className="text-3xl lg:text-4xl font-serif font-bold text-[#0B1F3A] tracking-tight leading-tight hover:text-[#C8A96A] transition-colors">
                        <Link href={targetLink}>{course.title}</Link>
                      </h3>

                      <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium whitespace-pre-line border-l-2 border-[#C8A96A] pl-5">
                        {course.description}
                      </p>

                      {/* Dynamic Syllabus Preview Highlights */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A96A]">WHO SHOULD REGISTER &amp; OUTCOMES:</h4>
                        <div className="grid sm:grid-cols-2 gap-3 text-xs text-[#0B1F3A]/80 font-bold">
                          {highlightTopics.map((topic, index) => (
                            <div key={index} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0 mt-0.5" />
                              <span className="leading-snug">{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats Strip and Custom CTAs */}
                    <div className="pt-8 border-t border-slate-200/80 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-[#0B1F3A]/60">
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-4 h-4 text-[#C8A96A]" />
                          <span>{course.duration} Weeks Duration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#0B1F3A]" />
                          <span>{course.level} Level</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#1F7A5A]" />
                          <span>{programFormat}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Button asChild className="h-14 px-8 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[9px] uppercase tracking-[0.25em] rounded-none border-none shadow-none flex-1 sm:flex-none">
                          <Link href={targetLink}>Explore Curriculum &amp; Syllabus</Link>
                        </Button>
                        <Button asChild className="h-14 px-8 border border-[#0B1F3A]/20 bg-transparent text-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-none font-black text-[9px] uppercase tracking-[0.25em] flex-1 sm:flex-none shadow-none">
                          <Link href={`/login?view=signup&redirectUrl=${encodeURIComponent('/courses?dialog=' + course.id)}`}>Submit Candidacy</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty Register Fallback */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-28 bg-white border border-slate-200 mt-12 space-y-6">
              <div className="w-16 h-16 bg-[#FAF9F6] border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
                 <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-[#0B1F3A]">No Matching Programs Identified</h3>
              <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                Please adjust your filter query to display the registered academic tracks.
              </p>
              <Button onClick={() => setSearchQuery("")} className="h-12 px-6 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest rounded-none shadow-none border-none">
                Reset Filter Query
              </Button>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

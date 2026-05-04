
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Star,
  Users,
  PlayCircle,
  Palette,
  Briefcase,
  Code,
  Megaphone,
  BarChart,
  Camera,
  Music,
  Cpu,
  Quote,
  GraduationCap,
  Handshake,
  Wrench,
  Radio
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import type { Course } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export default function Home() {
  const [trendingCourses, setTrendingCourses] = React.useState<Course[]>([]);
  const [allCourses, setAllCourses] = React.useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllCourses(data);
          setTrendingCourses(data.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const categories = useMemo(() => {
    if (!allCourses) return [];
    const categoryMap = new Map<string, React.ElementType>();
    const iconMap: { [key: string]: React.ElementType } = {
      'Hospitality': Handshake,
      'Facilities Management': Wrench,
      'Business': Briefcase,
      'Art & Design': Palette,
      'Finance': BarChart,
      'Graphic': Code,
      'Programming': Code,
      'Marketing': Megaphone,
      'Technology': Cpu,
      'Photography': Camera,
      'Music': Music,
    };

    allCourses.forEach(course => {
      if (!categoryMap.has(course.category)) {
        categoryMap.set(course.category, iconMap[course.category] || BookOpen);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, Icon]) => ({ name, icon: Icon }));
  }, [allCourses]);

  React.useEffect(() => {
    if (!carouselApi) {
      return
    }

    setCurrent(carouselApi.selectedScrollSnap() + 1)

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1)
    })
  }, [carouselApi])

  return (
    <>
      {/* Hero Section: The Distinction */}
      <section className="relative min-h-screen bg-[#0B1F3A] text-white flex items-center overflow-hidden py-24 md:py-0">
        {/* Subtle Luxury Pattern */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-emerald-500/10 blur-[120px] md:blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-slate-500/10 blur-[100px] md:blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-20 items-center">
            <div className="max-w-3xl">
              <ScrollAnimation animation="fade-in-up" delay={100}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 md:w-12 h-[2px] bg-[#C8A96A]" />
                  <span className="text-[#C8A96A] font-black text-[10px] md:text-xs uppercase tracking-[0.4em]">Ashford & Gray Academy</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[1.1] md:leading-[0.9] mb-10">
                  Mastering <span className="italic text-[#C8A96A]">Luxury</span>.<br />
                  Elevating Business.
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-slate-400 font-medium leading-relaxed max-w-xl mb-12">
                  Where Excellence is Refined, and Leaders are Distinct. Join an institution dedicated to global academic authority.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Button size="lg" className="h-16 md:h-20 px-10 md:px-12 text-base md:text-lg font-black bg-white text-[#0B1F3A] hover:bg-slate-100 transition-all rounded-full shadow-2xl" asChild>
                    <Link href="/courses">Explore Programs</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 md:h-20 px-10 md:px-12 text-base md:text-lg font-bold border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full backdrop-blur-sm bg-transparent">
                    Apply for Admission
                  </Button>
                </div>
              </ScrollAnimation>
            </div>

            <div className="relative hidden lg:block">
              <ScrollAnimation animation="scale-up" delay={300}>
                <div className="relative aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1F7A5A]/20 to-transparent rounded-full blur-3xl opacity-50" />
                  <Image
                    src="/A & G2.png"
                    alt="Ashford & Gray Crest"
                    fill
                    className="object-contain opacity-20 scale-125"
                  />
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Strip */}
      <section className="bg-white border-y border-slate-100 py-12 md:py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center opacity-80">
            <div className="flex flex-col items-center text-center gap-3 md:gap-4">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1F7A5A]">
                <GraduationCap className="w-5 md:w-6 h-5 md:h-6" />
              </div>
              <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#0B1F3A]">100% Online Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3 md:gap-4">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#C8A96A]">
                <Star className="w-5 md:w-6 h-5 md:h-6" />
              </div>
              <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#0B1F3A]">Institutional Excellence</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3 md:gap-4">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1F7A5A]">
                <Users className="w-5 md:w-6 h-5 md:h-6" />
              </div>
              <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#0B1F3A]">Global Alumnae</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3 md:gap-4">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0B1F3A]">
                <Handshake className="w-5 md:w-6 h-5 md:h-6" />
              </div>
              <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#0B1F3A]">Industry Recognition</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: About Snapshot */}
      <section className="py-24 md:py-40 bg-white overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 md:gap-32 items-center">
            <ScrollAnimation animation="fade-in-up">
              <div className="space-y-8 md:space-y-10">
                <div className="inline-flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#1F7A5A]" />
                  <span className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.4em]">The Institution</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#0B1F3A] leading-[1.1] md:leading-[1.1]">
                  Where Heritage Meets <br />
                  <span className="italic text-[#C8A96A]">Modern Mastery.</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
                  Ashford & Gray Academy is built on the philosophy that professional excellence is not just taught, but refined through practical application and global academic standards.
                </p>
                <div className="pt-6 md:pt-8">
                  <Button size="lg" className="h-16 px-10 rounded-full bg-[#0B1F3A] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#1F7A5A] transition-all shadow-xl" asChild>
                    <Link href="/about">Discover Our Legacy</Link>
                  </Button>
                </div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation animation="fade-in" delay={200} className="relative">
              <div className="relative aspect-[4/5] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white">
                <Image
                  src="/imagefx-6.png"
                  alt="Academic Environment"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 md:-bottom-12 -left-6 md:-left-12 w-48 md:w-64 h-48 md:h-64 bg-[#C8A96A]/5 backdrop-blur-3xl rounded-full -z-10" />
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Section 4: 3 Pillars (Cards Layout) */}
      <section className="py-24 md:py-40 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#0B1F3A] tracking-tight mb-6 md:mb-8">The Pillars of Distinction</h2>
             <p className="text-lg md:text-xl text-slate-500 font-medium">Refining the next generation of global leaders through three core values.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { 
                title: "Practical Mastery", 
                desc: "Go beyond theory with hands-on training built by industry leaders for the real world.",
                icon: Wrench,
                color: "#1F7A5A"
              },
              { 
                title: "Luxury Standard", 
                desc: "Refining professional conduct to the highest international levels of service and quality.",
                icon: Star,
                color: "#C8A96A"
              },
              { 
                title: "Global Relevance", 
                desc: "Curriculum aligned with international business innovation and global market demands.",
                icon: Handshake,
                color: "#0B1F3A"
              }
            ].map((pillar, idx) => (
              <ScrollAnimation key={pillar.title} animation="fade-in-up" delay={idx * 100}>
                <div className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 group h-full">
                  <div 
                    className="w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all mb-8 md:mb-10 shadow-lg"
                    style={{ backgroundColor: `${pillar.color}10`, color: pillar.color }}
                  >
                    <pillar.icon className="w-8 md:w-10 h-8 md:h-10" />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] mb-4 md:mb-6">{pillar.title}</h4>
                  <p className="text-base md:text-lg text-slate-500 leading-relaxed font-medium">{pillar.desc}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Programs Preview */}
      <section className="py-24 md:py-40 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-[#C8A96A]" />
                <p className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Signature Curricula</p>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#0B1F3A] leading-tight">Master Your <br /><span className="italic">Calling.</span></h2>
            </div>
            <Button variant="ghost" className="h-16 px-8 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] hover:bg-slate-50 rounded-full border border-slate-100 hidden md:flex" asChild>
              <Link href="/courses">View All Programs <ArrowRight className="ml-3 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {coursesLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[28rem] md:h-[32rem] rounded-[3rem] md:rounded-[4rem]" />)
            ) : trendingCourses.slice(0, 3).map((item, idx) => (
              <ScrollAnimation key={item.id} animation="fade-in-up" delay={idx * 100}>
                <Link href={`/courses`} className="group block h-full">
                  <div className="bg-white rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-slate-100 h-full flex flex-col hover:shadow-2xl transition-all duration-700">
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-all duration-1000" 
                      />
                      <div className="absolute top-6 md:top-8 left-6 md:left-8">
                         <div className="bg-[#0B1F3A]/90 backdrop-blur-xl text-white px-4 md:px-5 py-2 rounded-full font-black text-[8px] md:text-[9px] uppercase tracking-[0.2em]">
                           Signature Program
                         </div>
                      </div>
                      <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8">
                        <Badge className="bg-white text-[#0B1F3A] border-none font-black px-3 md:px-4 py-1.5 md:py-2 uppercase text-[8px] md:text-[9px] tracking-widest rounded-full shadow-lg">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 flex-1 flex flex-col">
                      <h3 className="text-2xl md:text-3xl font-serif text-[#0B1F3A] mb-6 leading-tight group-hover:text-[#1F7A5A] transition-colors">{item.title}</h3>
                      <div className="mt-auto pt-6 md:pt-8 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A96A]">{item.duration || "12 Weeks"} Duration</span>
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#0B1F3A] group-hover:text-white transition-all">
                           <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
          <div className="mt-12 md:hidden">
            <Button className="w-full h-16 bg-[#0B1F3A] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl" asChild>
               <Link href="/courses">View All Programs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 6: Founder Section */}
      <section className="py-24 md:py-40 bg-[#0B1F3A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-[#C8A96A]/20 blur-[100px] md:blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 md:gap-32 items-center">
            <ScrollAnimation animation="fade-in" className="order-2 lg:order-1 relative">
              <div className="relative max-w-sm md:max-w-md mx-auto lg:ml-0">
                <div className="absolute -inset-6 bg-[#C8A96A]/20 blur-3xl rounded-full opacity-50" />
                <div className="relative aspect-[3/4] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white/10">
                  <Image
                    src="/academy_hero_students.png"
                    alt="Founder Portrait"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                </div>
                <div className="absolute -bottom-6 md:-bottom-10 -right-6 md:-right-10 bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl hidden sm:block">
                   <div className="flex gap-1 text-[#C8A96A] mb-3 md:mb-4">
                     {Array.from({length: 5}).map((_, i) => <Star key={i} className="w-3 md:w-4 h-3 md:h-4 fill-current" />)}
                   </div>
                   <p className="text-[#0B1F3A] font-serif text-base md:text-lg leading-tight italic">"The Golden Standard"</p>
                </div>
              </div>
            </ScrollAnimation>
            
            <div className="order-1 lg:order-2 text-white">
              <ScrollAnimation animation="fade-in-up">
                <div className="space-y-8 md:space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[2px] bg-[#C8A96A]" />
                    <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Founder's Vision</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif tracking-tight leading-[1.1] md:leading-tight">
                    The Promise of <br />
                    <span className="italic text-[#C8A96A]">Distinction.</span>
                  </h2>
                  <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium italic">
                    "We believe that education should be as refined as the industries it serves. Our mission is to empower the next generation of global leaders with the distinction and authority they deserve."
                  </p>
                  <div className="pt-6 md:pt-10 flex items-center gap-6">
                    <div className="w-12 md:w-20 h-[1px] bg-white/20" />
                    <div>
                      <h4 className="text-2xl md:text-3xl font-serif">Dr. Julian Ashford</h4>
                      <p className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.3em] mt-2">Founder & President</p>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-40 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
          <ScrollAnimation animation="fade-in-up">
            <div className="inline-block mb-6 md:mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
                 <span className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-[0.4em]">Admissions Open</span>
                 <div className="w-8 md:w-12 h-[1px] bg-[#1F7A5A]" />
               </div>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-8xl font-serif text-[#0B1F3A] mb-10 md:mb-12 tracking-tight leading-[1.1]">
              Step into a <br />
              <span className="italic text-[#C8A96A]">Higher Standard.</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-8">
               <Button size="lg" className="h-16 md:h-20 px-10 md:px-16 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-full transition-all shadow-2xl" asChild>
                 <Link href="/login?view=signup">Apply for Admission</Link>
               </Button>
               <Button size="lg" variant="outline" className="h-16 md:h-20 px-10 md:px-16 border-slate-200 text-[#0B1F3A] hover:bg-slate-50 rounded-full font-black text-[10px] uppercase tracking-[0.4em]" asChild>
                  <Link href="/about">Speak to an Advisor</Link>
               </Button>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
}

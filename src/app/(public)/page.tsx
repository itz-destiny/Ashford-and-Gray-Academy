
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

  const testimonials = [
    {
      id: 1,
      quote: "The course structure and mentor support at Ashford & Gray are second to none. I was able to transition into a new career with confidence and a strong portfolio. Highly recommended for anyone serious about skilling up.",
      name: 'Devon Lane',
      title: 'UI/UX Designer at Google',
      avatarUrl: "/imagefx-3.png"
    },
    {
      id: 2,
      quote: "An incredible learning experience. The instructors are top-notch, and the curriculum is perfectly aligned with industry demands. I landed a promotion just months after completing my course.",
      name: 'Sarah Jenkins',
      title: 'Senior Developer at Microsoft',
      avatarUrl: "/imagefx-4.png"
    },
    {
      id: 3,
      quote: "This platform transformed my understanding of digital marketing. The practical, hands-on projects were invaluable. The community is vibrant and supportive, which made a huge difference.",
      name: 'Michael Chen',
      title: 'Marketing Lead at Amazon',
      avatarUrl: "/imagefx-5.png"
    },
  ]

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
      {/* Hero Section: The Transformation */}
      <section className="relative min-h-[90vh] bg-slate-950 text-white flex items-center overflow-hidden py-24">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0f172a] to-slate-900 opacity-90" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
          <div
            className="absolute inset-0 bg-[url('/wavy-background.svg')] bg-cover opacity-5 mix-blend-overlay scale-125"
            style={{ filter: 'brightness(2)' }}
          />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollAnimation animation="fade-in-up" delay={100}>
                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 px-4 py-1.5 mb-8 backdrop-blur-md">
                  ✨ Professional Education & Training
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter font-headline leading-[0.95] mb-8">
                  Learn New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Skills</span>.
                  Advance Your Career.
                </h1>
                <p className="text-lg lg:text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
                  Join thousands of students learning from industry professionals. We offer practical courses designed to help you get ahead in your career.
                </p>
                <div className="flex flex-wrap gap-5">
                  <Button size="lg" className="h-16 px-10 text-lg font-black bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] rounded-2xl" asChild>
                    <Link href="/courses">View All Courses</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-white/20 text-white hover:bg-white/10 hover:text-white rounded-2xl backdrop-blur-sm bg-transparent">
                    <PlayCircle className="mr-3 w-6 h-6 text-indigo-400" />
                    See How It Works
                  </Button>
                </div>

                {/* Micro Trust Stats */}
                <div className="mt-16 flex items-center gap-8 border-t border-white/5 pt-12">
                  <div>
                    <p className="text-3xl font-black text-white">20k<span className="text-indigo-500">+</span></p>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mt-1">Active Students</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <p className="text-3xl font-black text-white">4.9<span className="text-yellow-500">★</span></p>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mt-1">Course Rating</p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>

            <div className="relative">
              <ScrollAnimation animation="scale-up" delay={300} className="relative z-20">
                <div className="relative group">
                  {/* Decorative Frame */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 blur-2xl rounded-[3rem] opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                    <Image
                      src="/academy_hero_students.png"
                      alt="Collective Learning"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>

                  {/* Glass Floaties */}
                  <div className="absolute top-1/4 -left-12 p-6 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl animate-bounce-slow">
                    <div className="flex -space-x-3 mb-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-${400 + i * 100}`} />
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">+18</div>
                    </div>
                    <p className="text-xs font-bold text-white">Join the Community</p>
                  </div>

                  <div className="absolute bottom-12 -right-12 p-5 bg-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.4)] rounded-3xl border border-indigo-400/30">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section: The Strategy */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <ScrollAnimation animation="fade-in" delay={100}>
                <div className="relative rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-2xl">
                  <Image
                    src="/imagefx-6.png"
                    alt="Strategic Learning"
                    width={600}
                    height={600}
                    className="object-cover"
                  />
                </div>
                {/* Floating Mentor Tag */}
                <div className="absolute -bottom-10 right-10 p-6 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarImage src="/academy_mentor_portrait.png" />
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-black text-slate-900">Dr. Helena Vance</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Head of Pedagogy</p>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>

            <div>
              <ScrollAnimation animation="fade-in-up">
                <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Our Mission</p>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
                  Get the skills you need for <span className="italic font-serif">real</span> career growth.
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed mb-10">
                  We don't just teach theory; we focus on real-world application. Our curriculum is built by industry experts to help you apply what you learn immediately on the job.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="group">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 mb-2">Learn with Peers</h4>
                    <p className="text-sm text-slate-500 font-medium">Connect and learn with others in small, focused study groups.</p>
                  </div>
                  <div className="group">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all mb-4">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 mb-2">Hands-on Learning</h4>
                    <p className="text-sm text-slate-500 font-medium">Work on practical projects that prepare you for the workplace.</p>
                  </div>
                </div>

                <Button className="mt-12 h-14 px-10 rounded-2xl" asChild>
                  <Link href="/about">Discover the Academy Philosophy</Link>
                </Button>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines: The Categories */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6">Choose Your Subject</h2>
            <p className="text-lg text-slate-500 font-medium font-body">Carefully built programs designed to help you succeed in your industry.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => (
              <ScrollAnimation key={cat.name} animation="fade-in-up" delay={idx * 50}>
                <div className="group relative p-8 bg-white border border-slate-100 rounded-[2rem] hover:bg-slate-950 transition-all duration-500 cursor-pointer overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-white/10 group-hover:text-white transition-all mb-6">
                      <cat.icon className="w-7 h-7" />
                    </div>
                    <p className="font-black text-slate-900 group-hover:text-white transition-colors">{cat.name}</p>
                    <ArrowRight className="w-5 h-5 mt-4 text-indigo-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 group-hover:bg-white/5 transition-transform" />
                </div>
              </ScrollAnimation>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="ghost" className="font-black hover:bg-transparent hover:text-indigo-600 group" asChild>
              <Link href="/courses">All Academy Domains <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Broadcast Showcase */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse border-4 border-red-500/20" />
                <p className="text-red-600 font-black text-xs uppercase tracking-[0.3em]">Live Now</p>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Upcoming Live Classes</h2>
            </div>
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200">Global Schedule</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />)
            ) : trendingCourses.map((item, idx) => (
              <ScrollAnimation key={item.id} animation="fade-in-up" delay={idx * 100}>
                <div className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-100 shadow-2xl">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <div className="absolute top-6 left-6 right-6 flex justify-between">
                    <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-3 py-1">
                      {item.category}
                    </Badge>
                    <div className="p-2 bg-red-600 rounded-lg text-white font-black text-[10px] uppercase">Live</div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <h3 className="text-xl font-black leading-tight mb-4 group-hover:translate-y-[-10px] transition-transform">{item.title}</h3>
                    <div className="flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`} />
                        </Avatar>
                        <p className="text-xs font-bold text-white/70">Lead Faculty</p>
                      </div>
                      <Button size="sm" className="bg-white text-slate-950 rounded-xl font-black hover:bg-indigo-400 hover:text-white">Join</Button>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Voices of Success: Testimonials */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-indigo-600/5 skew-x-[-15deg] translate-x-1/2" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Student Stories</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">What Our Students Say</h2>
          </div>

          <Carousel setApi={setCarouselApi} plugins={[Autoplay({ delay: 6000 })]} className="max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((t) => (
                <CarouselItem key={t.id}>
                  <div className="px-4">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-10 md:p-16 rounded-[3rem] text-center">
                      <Quote className="w-16 h-16 text-indigo-500/20 mx-auto mb-10" />
                      <p className="text-2xl md:text-3xl font-medium text-slate-200 leading-relaxed italic mb-12">
                        "{t.quote}"
                      </p>
                      <div className="flex flex-col items-center">
                        <Avatar className="w-20 h-20 mb-6 ring-4 ring-indigo-500/20">
                          <AvatarImage src={t.avatarUrl} />
                        </Avatar>
                        <h4 className="text-xl font-black text-white">{t.name}</h4>
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mt-1">{t.title}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-3 mt-12">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => carouselApi?.scrollTo(i)}
                  className={`h-1.5 transition-all rounded-full ${i === current - 1 ? 'w-12 bg-indigo-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* The Invitation: Newsletter */}
      <section className="py-32 bg-white flex items-center justify-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-950 p-12 md:p-24 shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-6 leading-tight">Join Our <br />Newsletter.</h2>
                <p className="text-lg text-slate-400 font-medium">Get updates on new courses, upcoming events, and exclusive scholarship offers.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  className="h-16 px-6 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus-visible:ring-indigo-500"
                  placeholder="Official Email Address"
                />
                <Button className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

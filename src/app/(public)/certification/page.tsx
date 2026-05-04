"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Award, 
  ShieldCheck, 
  Globe, 
  Briefcase, 
  ArrowRight,
  Search,
  BookOpen,
  CheckCircle,
  Clock3,
  Smartphone,
  Trophy,
  PlayCircle,
  Info,
  Calendar,
  Star,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function CertificationPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = data.filter((c: Course) => 
            c.category === 'Certification' || c.category === 'Diploma'
          );
          setCourses(filtered);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Failed to fetch certifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertifications();
  }, []);

  const handleEnrollClick = (course: Course) => {
    router.push(`/login?courseId=${course.id}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={cn("w-4 h-4", i < Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : "text-slate-200")} />
    ));
  };

  return (
    <div className="bg-white min-h-screen">
      {/* High-Authority Hero */}
      <section className="relative py-24 md:py-32 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
        </div>
        
        <div className="container relative z-10 px-6 lg:px-12">
          <div className="max-w-3xl">
            <Badge className="bg-indigo-600 text-white border-none px-4 py-1.5 mb-8">
              Professional Certifications
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-8">
              Get Certified. <br />
              <span className="text-indigo-400">Get Recognized.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl">
              Our certificates are recognized by top companies and show that you have the skills to solve real problems. We help you build a professional profile that gets noticed.
            </p>
            <div className="flex flex-wrap gap-6">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black text-lg shadow-xl">
                 View Programs
              </Button>
              <div className="flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                 <ShieldCheck className="w-8 h-8 text-emerald-400" />
                 <div>
                    <p className="text-white font-black text-sm">Industry Standard</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Support</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-24 container px-6 lg:px-12">
         <div className="grid md:grid-cols-3 gap-12">
            {[
               { icon: Award, title: "Industry Backed", desc: "Our programs are developed alongside hiring managers from leading companies." },
               { icon: CheckCircle2, title: "Easy Verification", desc: "Employers can quickly verify your certificate online with a single click." },
               { icon: Briefcase, title: "Career Growth", desc: "Most of our students report better job opportunities after finishing their program." }
            ].map((p, i) => (
               <div key={i} className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-slate-950 transition-all duration-500 hover:-translate-y-2">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-8 shadow-sm">
                     <p.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-4 lowercase tracking-tight">{p.title}</h3>
                  <p className="text-slate-500 group-hover:text-slate-400 font-medium leading-relaxed">{p.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Active Certification Programs */}
      <section className="py-24 bg-slate-50/50">
         <div className="container px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-center md:text-left">
               <div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter mb-4">Certification Programs</h2>
                  <p className="text-slate-500 font-bold max-w-xl">Choose from a range of programs designed to give you the skills you need for your next role.</p>
               </div>
               <Link href="/courses" className="flex items-center gap-2 group text-indigo-600 font-black text-xs uppercase tracking-widest">
                  Explore full catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
               {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                     <Skeleton key={i} className="aspect-[4/5] rounded-[2.8rem] bg-slate-200" />
                  ))
               ) : courses.map((c) => (
                  <Dialog key={c.id}>
                    <DialogTrigger asChild>
                      <Card className="group relative aspect-[4/5] rounded-[2.8rem] overflow-hidden border-none shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer">
                        <Image src={c.imageUrl} alt={c.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        
                        <div className="absolute bottom-10 left-10 right-10 text-white">
                            <Badge className="bg-blue-600 mb-4">{c.category}</Badge>
                            <h3 className="text-2xl font-black tracking-tighter leading-tight mb-6 group-hover:text-blue-400 transition-colors">{c.title}</h3>
                            <div className="flex items-center justify-between pt-6 border-t border-white/20">
                              <div className="flex flex-col">
                                  <span className="text-xs font-black uppercase text-white/50 tracking-widest">Duration</span>
                                  <span className="font-bold">{c.duration} Weeks</span>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-950 transition-all">
                                 <PlayCircle className="w-5 h-5" />
                              </div>
                            </div>
                        </div>
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="sm:max-w-6xl p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.3)] bg-white max-h-[90vh] overflow-y-auto">
                        <div className="flex flex-col">
                          {/* Dark Header */}
                          <div className="bg-slate-950 p-10 md:p-16 lg:pr-[380px] text-white relative">
                            <div className="relative z-10 space-y-6">
                              <Badge className="bg-white/10 text-blue-400 border-none px-3 font-black text-[10px] uppercase tracking-widest leading-none h-6">
                                 {c.category}
                              </Badge>
                              <DialogTitle asChild>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] max-w-2xl">{c.title}</h2>
                              </DialogTitle>
                              <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">{c.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-6 text-sm font-bold">
                                 <div className="flex items-center gap-1.5 text-yellow-500">
                                    <span className="text-lg font-black">{c.rating}</span>
                                    <div className="flex">{renderStars(c.rating)}</div>
                                    <span className="text-slate-500">({c.reviews.toLocaleString()} reviews)</span>
                                 </div>
                                 <div className="text-slate-300">
                                    {c.reviews * 12} students enrolled
                                 </div>
                              </div>
                            </div>
                          </div>

                          {/* Floating Sidebar Content */}
                          <div className="hidden lg:block absolute top-[100px] right-12 w-[320px] bg-white rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-slate-100 p-1 z-50 overflow-hidden">
                             <div className="relative aspect-video w-full rounded-2xl overflow-hidden group">
                                <Image src={c.imageUrl} alt={c.title} fill className="object-cover" />
                                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                                   <PlayCircle className="w-12 h-12 text-white" />
                                </div>
                             </div>
                             <div className="p-8 space-y-6">
                                <div className="flex items-baseline gap-3">
                                   <span className="text-4xl font-black text-slate-950">₦{c.price.toLocaleString()}</span>
                                </div>
                                <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl" onClick={() => handleEnrollClick(c)}>
                                   Enroll Now
                                </Button>
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                   <div className="space-y-3">
                                      {[
                                         { icon: Clock3, text: `${c.duration * 4} hours on-demand video` },
                                         { icon: Trophy, text: 'Certificate of completion' },
                                         { icon: ShieldCheck, text: 'Industry recognized' }
                                      ].map((item, i) => (
                                         <div key={i} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                                            <item.icon className="w-4 h-4 text-slate-400" />
                                            <span>{item.text}</span>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Body */}
                          <div className="p-10 md:p-16 lg:pr-[420px] bg-white grid gap-16">
                             <section className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">What you'll learn</h3>
                                <div className="grid md:grid-cols-2 gap-y-4 gap-x-12">
                                   {['Professional excellence', 'Strategic leadership', 'Technical mastery', 'Global networking'].map((item, i) => (
                                      <div key={i} className="flex items-center gap-3">
                                         <CheckCircle className="w-5 h-5 text-emerald-500" />
                                         <span className="text-sm font-bold text-slate-600">{item}</span>
                                      </div>
                                   ))}
                                </div>
                             </section>

                             <section>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter mb-8">Course Content</h3>
                                <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden">
                                   {c.curriculum?.map((item, i) => (
                                      <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 border-b border-slate-50 last:border-none cursor-pointer group">
                                         <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-slate-400">{i + 1}</span>
                                            <span className="text-sm font-bold text-slate-700">{item}</span>
                                         </div>
                                         <PlayCircle className="w-4 h-4 text-slate-200 group-hover:text-indigo-600" />
                                      </div>
                                   ))}
                                </div>
                             </section>

                             {/* Instructor */}
                             <section className="pt-16 border-t border-slate-100">
                                <div className="flex gap-10">
                                   <Avatar className="h-24 w-24">
                                      <AvatarImage src={c.instructor?.avatarUrl} />
                                      <AvatarFallback>{getInitials(c.instructor?.name || '')}</AvatarFallback>
                                   </Avatar>
                                   <div>
                                      <h4 className="text-2xl font-black text-slate-950 mb-2">{c.instructor?.name || 'Instructor'}</h4>
                                      <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4">Lead Instructor</p>
                                      <p className="text-slate-500 font-medium leading-relaxed">Expert instructor with years of teaching at Ashford & Gray Academy.</p>
                                   </div>
                                </div>
                             </section>
                          </div>
                      </div>
                    </DialogContent>
                  </Dialog>
               ))}
            </div>
         </div>
      </section>

      {/* Certification Verification */}
      <section className="py-32 container px-6 lg:px-12">
         <div className="bg-slate-950 rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-center md:text-left">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
            <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
               <div>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-8">
                     Verify a <br />
                     <span className="text-indigo-400">Certificate</span>
                  </h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                     Employers can use our verification tool to quickly confirm the authenticity of your certificate.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-grow flex bg-white/5 rounded-2xl border border-white/10 p-2">
                        <input className="bg-transparent border-none text-white px-4 flex-grow focus:ring-0 placeholder:text-slate-600" placeholder="Credential ID (e.g. AG-XXXX)" />
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 rounded-xl">Verify</Button>
                     </div>
                  </div>
               </div>
               <div className="flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700 cursor-help">
                     <div className="flex justify-between items-start mb-12">
                        <ShieldCheck className="w-12 h-12" />
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Verification Code</p>
                           <p className="font-mono text-xs">AG-992-KLA</p>
                        </div>
                     </div>
                     <h4 className="text-2xl font-black mb-1">Jane Doe</h4>
                     <p className="text-sm font-medium opacity-80 mb-8">Professional Design Certification</p>
                     <div className="mt-auto flex justify-between items-end">
                        <div className="w-8 h-8 border-2 border-white/30 rounded-full" />
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Ashford & Gray Academy</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

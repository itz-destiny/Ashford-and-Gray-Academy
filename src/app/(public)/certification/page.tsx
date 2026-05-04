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
  CheckCircle2,
  Lock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

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
      <section className="relative py-32 md:py-48 bg-[#0B1F3A] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500/10 blur-[100px] rounded-full" />
        </div>
        
        <div className="container relative z-10 px-6 lg:px-12 text-center max-w-4xl mx-auto">
          <ScrollAnimation animation="fade-in-up">
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="w-8 h-[1px] bg-[#C8A96A]" />
              <span className="text-[#C8A96A] font-black text-xs uppercase tracking-[0.4em]">Academic Distinction</span>
              <div className="w-8 h-[1px] bg-[#C8A96A]" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-8">
              Certification of <br />
              <span className="italic text-[#C8A96A]">Mastery.</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium leading-relaxed mb-12 max-w-3xl mx-auto">
              Elevate your professional profile with credentials recognized by the world’s leading institutions. Distinctive. Professional. Recognized.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className="h-16 px-12 rounded-full bg-[#C8A96A] hover:bg-[#B69759] text-white font-black text-lg shadow-xl">
                 Explore Certifications
              </Button>
              <div className="flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                 <ShieldCheck className="w-6 h-6 text-emerald-400" />
                 <span className="text-white font-bold text-sm tracking-widest uppercase">Global Authority</span>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-32 container px-6 lg:px-12">
         <div className="grid md:grid-cols-3 gap-16">
            {[
               { icon: Award, title: "Global Standard", desc: "Our programs are developed alongside executive leaders from world-class industries." },
               { icon: CheckCircle2, title: "Secure Verification", desc: "Digital credentials that can be verified instantly via our secure institutional portal." },
               { icon: Briefcase, title: "Executive Career Growth", desc: "Alumni report significant advancement into leadership roles following certification." }
            ].map((p, i) => (
               <ScrollAnimation key={i} animation="fade-in-up" delay={i * 100} className="group">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1F7A5A] group-hover:bg-[#1F7A5A] group-hover:text-white transition-all mb-8 shadow-sm">
                     <p.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif text-[#0B1F3A] mb-4">{p.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{p.desc}</p>
               </ScrollAnimation>
            ))}
         </div>
      </section>

      {/* Active Certification Programs */}
      <section className="py-32 bg-slate-50">
         <div className="container px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
               <div>
                  <h2 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight">Certification Programs</h2>
                  <div className="w-20 h-1 bg-[#C8A96A] mt-6" />
               </div>
               <Link href="/courses" className="flex items-center gap-2 group text-[#0B1F3A] font-black text-xs uppercase tracking-widest hover:text-[#1F7A5A] transition-colors">
                  View Full Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
               {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                     <Skeleton key={i} className="h-96 rounded-[3rem] bg-slate-200" />
                  ))
               ) : courses.map((c, idx) => (
                  <ScrollAnimation key={c.id} animation="fade-in-up" delay={idx * 50}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="group relative h-[500px] rounded-[3rem] overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer">
                          <Image src={c.imageUrl} alt={c.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-transparent" />
                          
                          <div className="absolute bottom-12 left-10 right-10 text-white">
                              <Badge className="bg-[#C8A96A] text-white border-none px-3 py-1 mb-6 font-black uppercase tracking-widest text-[9px]">{c.category}</Badge>
                              <h3 className="text-2xl font-serif leading-tight mb-8 group-hover:text-[#C8A96A] transition-colors">{c.title}</h3>
                              <div className="flex items-center justify-between pt-8 border-t border-white/20">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-1">Duration</span>
                                    <span className="font-bold text-lg">{c.duration} Weeks</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-[#C8A96A] group-hover:text-white transition-all">
                                   <ArrowRight className="w-6 h-6" />
                                </div>
                              </div>
                          </div>
                        </Card>
                      </DialogTrigger>
                      
                      <DialogContent className="sm:max-w-6xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
                          <div className="flex flex-col">
                            {/* Premium Header */}
                            <div className="bg-[#0B1F3A] p-16 lg:pr-[420px] text-white relative">
                              <div className="relative z-10 space-y-8">
                                <Badge className="bg-white/10 text-[#C8A96A] border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest leading-none">
                                   {c.category}
                                </Badge>
                                <DialogTitle asChild>
                                  <h2 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight max-w-2xl">{c.title}</h2>
                                </DialogTitle>
                                <p className="text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">{c.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-8">
                                   <div className="flex items-center gap-2">
                                      <div className="flex">{renderStars(c.rating)}</div>
                                      <span className="text-slate-400 font-bold ml-2">({c.reviews.toLocaleString()})</span>
                                   </div>
                                   <div className="w-px h-6 bg-white/10" />
                                   <div className="text-slate-300 font-bold tracking-widest uppercase text-[10px]">
                                      {c.reviews * 12} Students Enrolled
                                   </div>
                                </div>
                              </div>
                            </div>

                            {/* Floating Sidebar Content */}
                            <div className="hidden lg:block absolute top-[100px] right-12 w-[340px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden">
                               <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden group">
                                  <Image src={c.imageUrl} alt={c.title} fill className="object-cover" />
                                  <div className="absolute inset-0 bg-[#0B1F3A]/40 flex items-center justify-center">
                                     <PlayCircle className="w-14 h-14 text-white" />
                                  </div>
                               </div>
                               <div className="p-10 space-y-8">
                                  <div className="flex items-baseline gap-3">
                                     <span className="text-4xl font-serif text-[#0B1F3A]">₦{c.price.toLocaleString()}</span>
                                  </div>
                                  <Button className="w-full h-16 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-lg rounded-2xl" onClick={() => handleEnrollClick(c)}>
                                     Apply Now
                                  </Button>
                                  <div className="space-y-4 pt-8 border-t border-slate-100">
                                     {[
                                        { icon: Clock3, text: `${c.duration * 4} hours total instruction` },
                                        { icon: Trophy, text: 'Digital Institutional Certificate' },
                                        { icon: ShieldCheck, text: 'Industry Recognized Credential' }
                                     ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 text-sm font-medium text-slate-600">
                                           <item.icon className="w-5 h-5 text-[#1F7A5A]" />
                                           <span>{item.text}</span>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                            </div>

                            {/* Body */}
                            <div className="p-16 lg:pr-[460px] bg-white">
                               <div className="grid gap-20">
                                 <section className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-10">Certification Outcomes</h3>
                                    <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
                                       {['Executive Excellence', 'Strategic Mastery', 'International Standards', 'Professional Authority'].map((item, i) => (
                                          <div key={i} className="flex items-center gap-4">
                                             <CheckCircle className="w-5 h-5 text-[#1F7A5A]" />
                                             <span className="text-base font-bold text-[#0B1F3A]">{item}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </section>

                                 <section>
                                    <h3 className="text-3xl font-serif text-[#0B1F3A] mb-10">Program Curriculum</h3>
                                    <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden">
                                       {c.curriculum?.map((item, i) => (
                                          <div key={i} className="flex items-center justify-between p-8 hover:bg-slate-50 border-b border-slate-50 last:border-none cursor-pointer group transition-all">
                                             <div className="flex items-center gap-6">
                                                <span className="text-[10px] font-black text-slate-400 tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                                                <span className="text-base font-bold text-slate-700 group-hover:text-[#0B1F3A]">{item}</span>
                                             </div>
                                             <PlayCircle className="w-6 h-6 text-slate-200 group-hover:text-[#1F7A5A]" />
                                          </div>
                                       ))}
                                    </div>
                                 </section>

                                 {/* Instructor */}
                                 <section className="pt-16 border-t border-slate-100">
                                    <div className="flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
                                       <Avatar className="h-32 w-32 shadow-xl ring-4 ring-slate-50">
                                          <AvatarImage src={c.instructor?.avatarUrl} />
                                          <AvatarFallback>{getInitials(c.instructor?.name || '')}</AvatarFallback>
                                       </Avatar>
                                       <div>
                                          <h4 className="text-3xl font-serif text-[#0B1F3A] mb-2">{c.instructor?.name || 'Faculty Member'}</h4>
                                          <p className="text-[#1F7A5A] font-black text-[10px] uppercase tracking-widest mb-6">Distinguished Faculty</p>
                                          <p className="text-lg text-slate-500 leading-relaxed font-medium">An expert practitioner committed to excellence in professional development and institutional growth.</p>
                                       </div>
                                    </div>
                                 </section>
                               </div>
                            </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </ScrollAnimation>
               ))}
            </div>
         </div>
      </section>

      {/* Certification Verification */}
      <section className="py-32 container px-6 lg:px-12">
         <ScrollAnimation animation="fade-in-up">
            <div className="bg-[#0B1F3A] rounded-[4rem] p-16 md:p-32 relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-[50%] h-full bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2" />
               <div className="grid lg:grid-cols-2 gap-24 items-center relative z-10">
                  <div>
                     <div className="flex items-center gap-3 mb-8">
                        <Lock className="w-5 h-5 text-[#C8A96A]" />
                        <span className="text-[#C8A96A] font-black text-[10px] uppercase tracking-[0.4em]">Secure Portal</span>
                     </div>
                     <h2 className="text-5xl md:text-6xl font-serif text-white tracking-tight leading-tight mb-8">
                        Verify a <br />
                        <span className="italic text-[#C8A96A]">Credential.</span>
                     </h2>
                     <p className="text-slate-400 font-medium text-xl leading-relaxed mb-12">
                        Employers and institutions can instantly verify the authenticity of Ashford & Gray credentials through our secure registry.
                     </p>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow flex bg-white/5 backdrop-blur-md rounded-full border border-white/10 p-2 focus-within:border-[#C8A96A] transition-all">
                           <input 
                              className="bg-transparent border-none text-white px-8 flex-grow focus:ring-0 placeholder:text-slate-600 font-medium" 
                              placeholder="Institutional ID (e.g. AG-2024-XXXX)" 
                           />
                           <Button className="bg-[#C8A96A] hover:bg-[#B69759] text-white font-black px-10 rounded-full transition-all">Verify Now</Button>
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-center lg:justify-end">
                     <div className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-br from-[#1F7A5A] to-[#0B1F3A] rounded-[3rem] p-12 text-white shadow-2xl group cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/wavy-background.svg')] opacity-5" />
                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-16">
                              <ShieldCheck className="w-16 h-16 text-[#C8A96A]" />
                              <div className="text-right">
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-1">Registry Code</p>
                                 <p className="font-mono text-xs opacity-60">AG-INST-773-KLA</p>
                              </div>
                           </div>
                           <div>
                              <h4 className="text-3xl font-serif mb-2">Mastery Certificate</h4>
                              <p className="text-sm font-medium text-[#C8A96A] tracking-[0.1em] uppercase">Professional Design & Strategy</p>
                           </div>
                           <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-end">
                              <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Ashford & Gray Academy</div>
                              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                 <Lock className="w-4 h-4 opacity-40" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </ScrollAnimation>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { Badge } from "@/components/ui/badge";
import { 
    Loader2, Mail, CheckCircle2, ChevronRight, BookOpen, Star, Sparkles, Building, Landmark
} from "lucide-react";

interface InsightArticle {
    category: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    fullText: string;
}

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'newsletter_page' }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `HTTP ${res.status}`);
            }
            toast({
                title: "Subscription Authorized",
                description: "You've successfully subscribed to Ashford & Gray Newsletter Insights.",
            });
            setSuccess(true);
            setEmail("");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            toast({
                variant: "destructive",
                title: "Registry Error",
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    const publications: InsightArticle[] = [
        {
            category: "THE LUXURY MARKET",
            title: "Decoding the Post-Digital Consumer: How Heritage Brands Retain Exclusive Value",
            excerpt: "As e-commerce democratizes luxury, heritage institutions must reinvent physical exclusivity. This study examines spatial and digital boundaries designed for elite retention.",
            author: "Prof. Catherine Gray",
            date: "May 2026",
            readTime: "7 Min Read",
            fullText: "Heritage brands must transcend transactional boundaries to protect high-end prestige value. Moving forward, luxury services should transition toward tailored digital-physical environments."
        },
        {
            category: "EXECUTIVE PRESENCE",
            title: "The Discipline of Discretion: Principles of Elite Leadership in Modern Hospitality Operations",
            excerpt: "Why executional intelligence and absolute discretion are the highest valued commodities in VIP concierge and international protocol management sectors.",
            author: "Myne Wilfred, CEO",
            date: "April 2026",
            readTime: "9 Min Read",
            fullText: "Discretion is not merely silent conduct; it is the strategic management of confidentiality and protocol to guarantee the emotional security and prestige comfort of VIP clients."
        },
        {
            category: "GLOBAL STRATEGY",
            title: "Navigating Multi-Market Expansion in High-Growth Hospitality Sectors",
            excerpt: "An in-depth framework for scaling luxury hotel brands across African and European boundaries, leveraging localized heritage and institutional systems.",
            author: "Academic Board",
            date: "March 2026",
            readTime: "11 Min Read",
            fullText: "Scaling premium systems into multi-market corridors requires robust localization of aesthetics and deep regulatory whitelists. Establishing centralized operations guarantees uniform service delivery."
        },
        {
            category: "ACADEMIC EXCELLENCE",
            title: "The Pedagogy of Excellence: Curriculum Design for High-Pressure Domestic Administration",
            excerpt: "A critical review of the educational models that shape entry-level practitioners into high-efficiency residency supervisors and estate managers.",
            author: "Prof. Catherine Gray",
            date: "February 2026",
            readTime: "8 Min Read",
            fullText: "Modern estate leadership requires a delicate blend of soft-service orchestration and robust technical facility systems. Our curricula bridge this division seamlessly."
        },
        {
            category: "FINANCIAL STRATEGY",
            title: "Prestige Economics: Investment Returns on Ultra-Luxury Asset Management Systems",
            excerpt: "How C-Suite leaders coordinate high-value investments in estate restoration, luxury vehicle fleets, and elite hospitality holdings for long-term equity.",
            author: "Academic Board",
            date: "January 2026",
            readTime: "10 Min Read",
            fullText: "Maintaining high-value assets demands structured preservation routines and strict capital depreciation plans. Elite managers safeguard institutional legacy through meticulous balance control."
        }
    ];

    return (
        <div className="bg-[#FAF9F6] min-h-screen text-[#0B1F3A]">
            
            {/* Top Border Accent */}
            <div className="h-2 bg-[#C8A96A] w-full" />

            {/* Editorial Hero Header */}
            <header className="bg-[#0B1F3A] text-white py-20 md:py-28 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A96A] rounded-full blur-[100px] translate-x-1/4 -translate-y-1/4" />
                </div>
                
                <div className="container px-6 lg:px-12 mx-auto relative z-10 text-center max-w-4xl space-y-6">
                    <ScrollAnimation animation="fade-in-up">
                        <div className="inline-flex items-center gap-3 mb-4 px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10">
                            <Sparkles className="w-4 h-4 text-[#C8A96A]" />
                            <span className="text-[#C8A96A] font-black text-[9px] uppercase tracking-[0.3em]">Institutional Insights</span>
                        </div>
                    </ScrollAnimation>
                    
                    <ScrollAnimation animation="fade-in-up" delay={100}>
                        <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-none text-white">
                            Newsletter &amp; <br />
                            <span className="italic font-serif font-normal text-[#C8A96A]">Research Publications</span>
                        </h1>
                    </ScrollAnimation>

                    <ScrollAnimation animation="fade-in-up" delay={200}>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                            Perspectives on luxury market economics, elite executive presence, hospitality operations, and global strategic protocol.
                        </p>
                    </ScrollAnimation>
                </div>
            </header>

            {/* Subscription Card & Article Grid Grid */}
            <div className="container px-6 lg:px-12 mx-auto py-20 md:py-28">
                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left: Article Insights Feed */}
                    <main className="lg:col-span-8 space-y-16">
                        <div className="border-b border-slate-200 pb-4">
                            <h2 className="text-[10px] font-black text-[#0B1F3A] uppercase tracking-[0.3em]">RECENT PUBLICATIONS</h2>
                        </div>

                        <div className="space-y-12">
                            {publications.map((art, idx) => (
                                <ScrollAnimation key={art.title} animation="fade-in-up" delay={idx * 50}>
                                    <article className="bg-white border border-slate-200 border-t-4 border-t-[#C8A96A] p-8 md:p-12 space-y-6 hover:shadow-md transition-shadow">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge className="bg-[#0B1F3A] text-white border-none font-bold text-[8px] uppercase tracking-widest px-3 py-1 rounded-none">
                                                {art.category}
                                            </Badge>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{art.date}</span>
                                        </div>

                                        <h3 className="text-2xl font-serif font-bold text-[#0B1F3A] hover:text-[#1F7A5A] transition-colors leading-tight">
                                            {art.title}
                                        </h3>

                                        <p className="text-sm text-[#0B1F3A]/75 leading-relaxed font-medium">
                                            {art.excerpt}
                                        </p>

                                        <div className="bg-[#FAF9F6] p-6 border-l-2 border-[#1F7A5A]">
                                            <p className="text-xs text-[#0B1F3A]/85 italic leading-relaxed font-semibold">
                                                "{art.fullText}"
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#0B1F3A]/60">
                                            <span>Authored by: <strong className="text-[#0B1F3A]">{art.author}</strong></span>
                                            <span className="text-[#1F7A5A] font-bold flex items-center gap-1">
                                                {art.readTime}
                                            </span>
                                        </div>
                                    </article>
                                </ScrollAnimation>
                            ))}
                        </div>
                    </main>

                    {/* Right Sticky: Subscription Box */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
                        <div className="bg-[#0B1F3A] text-white p-8 md:p-10 border-t-4 border-t-[#C8A96A] shadow-lg space-y-6 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C8A96A] rounded-full blur-2xl" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-[#C8A96A]">
                                    <Mail className="w-6 h-6" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-serif text-xl font-bold text-white leading-tight">Registry Subscription</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                        Receive exclusive whitepapers, global protocol manuals, and cohort invitations directly from our Academic Registry.
                                    </p>
                                </div>

                                {success ? (
                                    <div className="bg-white/5 border border-emerald-500/20 p-6 space-y-4 text-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                                        <p className="text-xs font-bold text-emerald-400">Subscription Authorized</p>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            Please check your inbox to confirm your membership status.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="Enter your professional email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-white/5 border-white/10 text-white rounded-none h-12 focus:ring-[#C8A96A] placeholder:text-slate-500"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-14 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black text-[10px] uppercase tracking-widest rounded-none shadow-none border-none mt-2"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-[#0B1F3A]" />
                                            ) : (
                                                "Authorize Subscription"
                                            )}
                                        </Button>
                                    </form>
                                )}

                                <div className="space-y-3 pt-6 border-t border-white/5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-[#C8A96A]" />
                                        <span>C-Suite Exclusivity</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Landmark className="w-4 h-4 text-[#C8A96A]" />
                                        <span>Ivy-Level Compliance</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admissions Advisor Spot */}
                        <div className="bg-white border border-slate-200 p-8 space-y-4">
                            <h4 className="font-serif text-sm font-bold text-[#0B1F3A]">Looking for Academic Training?</h4>
                            <p className="text-[11px] text-[#0B1F3A]/70 leading-relaxed font-semibold">
                                Speak directly to an admissions advisor to align your academic goals with our flagship certificates.
                            </p>
                            <Button asChild variant="outline" className="w-full h-12 text-[9px] font-black uppercase tracking-widest text-[#0B1F3A] border-slate-200 hover:bg-slate-50 rounded-none">
                                <a href="/contact">Speak to Advisor</a>
                            </Button>
                        </div>
                    </aside>

                </div>
            </div>
            
        </div>
    );
}

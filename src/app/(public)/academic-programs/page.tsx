"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export default function AcademicProgramsOverview() {
  const pathways = [
    {
      title: "Professional Certifications",
      description: "Internationally recognised credentials covering housekeeping, hospitality, events & protocol, executive assistance, and global relationship management.",
      href: "/certifications",
      badge: "Professional Certifications",
      programs: [
        "Housekeeping and Domestic Management",
        "Hospitality Management",
        "Events and Protocol Management",
        "Executive Assistant Management",
        "Hospitality and Global Relationship",
      ],
    },
    {
      title: "Diploma Programs",
      description: "Comprehensive six-month professional diplomas in hospitality, business innovation, professional development, and events management.",
      href: "/programs",
      badge: "Diploma Programs",
      programs: [
        "Hospitality Management",
        "Business Innovation and Entrepreneurship",
        "Professional Development and Global Relations",
        "Events and Protocol Management",
      ],
    },
    {
      title: "Executive Master Class",
      description: "Our signature executive-level programme — The Silent Standard — designed to cultivate disciplined leaders, operational strategists, and institutional authorities.",
      href: "/executive",
      badge: "Executive Master Class",
      programs: [
        "The Silent Standard",
      ],
    },
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#0B1F3A]">

      {/* Top Gold Accent */}
      <div className="h-2 bg-[#C8A96A] w-full" />

      {/* Dark Luxury Breadcrumb Bar */}
      <div className="bg-[#061222] text-white/50 text-[10px] font-bold uppercase tracking-widest py-5 border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-12 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Ashford &amp; Gray Academy</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/20" />
          <span className="text-white">Academic Programs</span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="bg-[#0B1F3A] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A96A] rounded-full blur-[100px]" />
        </div>

        <div className="container px-6 lg:px-12 mx-auto relative z-10 text-center max-w-3xl space-y-6">
          <ScrollAnimation animation="fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-[#C8A96A]" />
              <span className="text-[#C8A96A] font-black text-[9px] uppercase tracking-[0.3em]">Academic Directory</span>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-in-up" delay={100}>
            <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-none">
              Academic <span className="text-[#C8A96A]">Programs</span>
            </h1>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-in-up" delay={200}>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed font-semibold">
              Ashford &amp; Gray Academy offers three distinct educational tracks designed
              to develop professionals at every stage — from foundation certifications
              to executive-level mastery.
            </p>
          </ScrollAnimation>
        </div>
      </header>

      {/* Programme Tracks */}
      <main className="container px-6 lg:px-12 mx-auto py-24 md:py-32">
        <div className="space-y-12">

          <ScrollAnimation animation="fade-in-up">
            <div className="border-b border-slate-200 pb-4 text-left">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]">SELECT A PROGRAM PATHWAY</h2>
            </div>
          </ScrollAnimation>

          {/* 3-column cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {pathways.map((path, idx) => (
              <ScrollAnimation key={path.title} animation="fade-in-up" delay={idx * 100}>
                <Link href={path.href} className="group block h-full">
                  <div className="bg-[#B9CEDA]/30 hover:bg-[#B9CEDA]/50 border border-slate-200/50 shadow-sm group-hover:shadow-lg p-10 h-full flex flex-col justify-between items-start text-left min-h-[360px] transition-all duration-300 relative rounded-none">

                    {/* Top Content */}
                    <div className="space-y-5 flex-1">
                      <span className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.2em] block">
                        {path.badge}
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-[#0B1F3A] leading-tight border-b border-slate-200/40 pb-3">
                        {path.title}
                      </h3>
                      <p className="text-xs text-[#0B1F3A]/75 leading-relaxed font-semibold">
                        {path.description}
                      </p>

                      {/* Programme list */}
                      <ul className="space-y-1.5 pt-2">
                        {path.programs.map((prog) => (
                          <li key={prog} className="flex items-start gap-2 text-[10px] font-bold text-[#0B1F3A]/60 uppercase tracking-wider">
                            <span className="w-1 h-1 bg-[#C8A96A] rounded-full mt-1.5 flex-shrink-0" />
                            {prog}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Arrow (HBS Style) */}
                    <div className="w-10 h-10 rounded-none bg-white/40 border border-slate-200 flex items-center justify-center text-[#0B1F3A] group-hover:bg-[#0B1F3A] group-hover:text-white transition-all duration-300 mt-8">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>

        </div>
      </main>

      {/* Bottom Informational Bar */}
      <section className="bg-[#0B1F3A] text-white py-16 text-center">
        <div className="container px-6 mx-auto max-w-3xl space-y-6">
          <h3 className="text-xl font-serif">Not sure which pathway is right for you?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Our academic advisors are available to assist you in aligning your experience and goals with the right programme.
          </p>
          <div className="pt-2">
            <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C8A96A] hover:text-white transition-colors">
              <span>Schedule an Academic Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

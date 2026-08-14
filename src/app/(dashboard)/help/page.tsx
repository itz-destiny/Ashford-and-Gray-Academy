
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, FileText, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

const HELP_TOPICS = [
    { icon: MessageCircle, title: "Live Consultation", desc: "Connect with our support registrars in real-time for urgent inquiries." },
    { icon: FileText, title: "Documentation", desc: "Comprehensive guides on using the platform and academic policies." },
    { icon: HelpCircle, title: "FAQ", desc: "Quick answers to frequently asked questions about enrollment and billing." },
    { icon: Phone, title: "Direct Contact", desc: "Reach our administrative office via telephone for executive support." },
];

export default function HelpPage() {
    return (
        <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6]">
            <div className="flex items-center gap-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#F6F4F2] shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-[#0B1F3A]" />
                    </Button>
                </Link>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Support</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                        Institutional <span className="text-[#C8A96A]">Support.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
                        How can we assist your academic journey today?
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {HELP_TOPICS.map((topic) => (
                    <Card key={topic.title} className="p-8 rounded-none border border-[#0B1F3A]/10 shadow-sm hover:shadow-md hover:border-[#C8A96A] transition-all duration-300 group cursor-pointer bg-white">
                        <div className="w-14 h-14 bg-[#F6F4F2] border border-[#0B1F3A]/5 rounded-none flex items-center justify-center text-[#0B1F3A] mb-6 group-hover:text-[#C8A96A] transition-colors">
                            <topic.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-serif text-[#0B1F3A] mb-2">{topic.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{topic.desc}</p>
                    </Card>
                ))}
            </div>

            <Card className="p-12 lg:p-16 rounded-none border border-[#0B1F3A] border-t-4 border-t-[#C8A96A] shadow-xl bg-[#0B1F3A] text-white relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8A96A]/10 rounded-full blur-[80px] opacity-50" />
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-serif">Still need assistance?</h2>
                    <p className="text-white/60 text-lg leading-relaxed">Our dedicated team of academic advisors is available Monday through Friday, 9:00 AM to 6:00 PM GMT.</p>
                    <Link href="/communications">
                        <Button className="bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-black px-12 py-6 rounded-none shadow-none transition-all h-auto text-[10px] uppercase tracking-widest mt-4">
                            Start a Dialogue
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}

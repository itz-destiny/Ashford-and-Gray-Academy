
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, FileText, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
    return (
        <div className="p-6 md:p-12 space-y-12 max-w-6xl mx-auto pb-32">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A]">Institutional Support</h1>
                    <p className="text-slate-400 font-medium mt-2">How can we assist your academic journey today?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="p-8 rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer bg-white">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1F7A5A] mb-6 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-serif text-[#0B1F3A] mb-2">Live Consultation</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Connect with our support registrars in real-time for urgent inquiries.</p>
                </Card>

                <Card className="p-8 rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer bg-white">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-serif text-[#0B1F3A] mb-2">Documentation</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Comprehensive guides on using the platform and academic policies.</p>
                </Card>

                <Card className="p-8 rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer bg-white">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-serif text-[#0B1F3A] mb-2">FAQ</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Quick answers to frequently asked questions about enrollment and billing.</p>
                </Card>

                <Card className="p-8 rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer bg-white">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                        <Phone className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-serif text-[#0B1F3A] mb-2">Direct Contact</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">Reach our administrative office via telephone for executive support.</p>
                </Card>
            </div>

            <Card className="p-12 rounded-[50px] border-none shadow-sm bg-[#0B1F3A] text-white relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-serif">Still need assistance?</h2>
                    <p className="text-white/60 max-w-2xl text-lg">Our dedicated team of academic advisors is available Monday through Friday, 9:00 AM to 6:00 PM GMT.</p>
                    <Link href="/communications">
                        <Button className="bg-[#C8A96A] hover:bg-[#B69759] text-white font-black px-12 py-6 rounded-2xl shadow-xl transition-all h-auto text-[10px] uppercase tracking-widest mt-4">
                            Start a Dialogue
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <HelpCircle size={400} />
                </div>
            </Card>
        </div>
    );
}

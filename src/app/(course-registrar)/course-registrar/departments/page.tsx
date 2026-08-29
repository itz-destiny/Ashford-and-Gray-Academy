"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    Shield,
    Database,
    Globe,
    Lock,
    ChevronRight,
    Box,
    FileCode
} from "lucide-react";

export default function DepartmentSettingsPage() {
    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Department <span className="text-[#C8A96A]">Settings.</span>
                        <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10 rounded-none px-3 font-black text-[10px] uppercase tracking-widest">Institutional Config</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Configure academic departments, grading policies, and institutional metadata.</p>
                </div>
                <Button className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                    Save Variables
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                        <div className="p-8 border-b border-[#0B1F3A]/10">
                            <h2 className="text-2xl font-serif text-[#0B1F3A]">Academic Logic</h2>
                            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em] mt-1">Core System Parameters</p>
                        </div>
                        <div className="p-8 space-y-2">
                            {[
                                { title: "Grading Scale", desc: "Define institutional pass marks and credit weights.", icon: Database, value: "4.0 Weighted" },
                                { title: "Admissions Hub", desc: "Enable automated enrollment for public certifications.", icon: Globe, value: "Public Enabled" },
                                { title: "Module Gating", desc: "Require previous lesson completion before next access.", icon: Lock, value: "Hard Gating" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 group cursor-pointer hover:bg-[#F6F4F2] p-6 transition-all border border-transparent hover:border-[#0B1F3A]/5">
                                    <div className="bg-[#F6F4F2] p-4 text-[#C8A96A] border border-[#0B1F3A]/5 transition-colors group-hover:bg-[#0B1F3A] group-hover:text-white">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-[#0B1F3A] text-lg uppercase tracking-tight">{item.title}</h4>
                                            <Badge variant="outline" className="rounded-none border-[#C8A96A]/30 text-[#0B1F3A] font-black text-[10px]">{item.value}</Badge>
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                    <div className="self-center">
                                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden">
                        <div className="p-8 border-b border-[#0B1F3A]/10">
                            <h2 className="text-2xl font-serif text-[#0B1F3A]">Faculty Structure</h2>
                            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em] mt-1">Institutional Taxonomy</p>
                        </div>
                        <div className="p-8">
                            <div className="grid md:grid-cols-2 gap-3">
                                {["Computer Science", "Business School", "Finance & Fintech", "Social Sciences", "Digital Arts", "Institutional Core"].map((dept, i) => (
                                    <div key={i} className="p-4 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-between group hover:bg-[#0B1F3A] transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Box className="w-4 h-4 text-slate-300 group-hover:text-[#C8A96A]" />
                                            <span className="font-black text-slate-700 text-sm group-hover:text-white uppercase tracking-tight">{dept}</span>
                                        </div>
                                        <Settings className="w-4 h-4 text-slate-300 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                                <Button variant="outline" className="p-4 rounded-none border-dashed border-2 border-[#0B1F3A]/10 text-slate-400 font-black text-sm hover:bg-[#F6F4F2] hover:border-[#0B1F3A]/20 h-auto shadow-none">
                                    + Add New Faculty
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8 overflow-hidden relative group">
                        <Shield className="w-10 h-10 mb-6 text-[#C8A96A]" />
                        <h3 className="text-2xl font-serif text-white mb-2">Data Sovereignty</h3>
                        <p className="text-white/60 text-sm font-medium leading-relaxed mb-10">
                            Manage department visibility and student data routing across the institution's cloud infrastructure.
                        </p>
                        <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/20 font-black h-12 rounded-none uppercase tracking-widest text-[10px] shadow-none">
                            Audit Security
                        </Button>
                    </div>

                    <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-8 space-y-6">
                        <div>
                            <h3 className="text-lg font-serif text-[#0B1F3A] mb-1">API Integration</h3>
                            <p className="text-xs font-bold text-slate-400 tracking-tight">Sync department data with external LMS tools.</p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { name: "Webhooks", status: "Active" },
                                { name: "External Auth", status: "Disabled" },
                                { name: "Report Bridge", status: "Active" },
                            ].map((api, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[#F6F4F2]">
                                    <div className="flex items-center gap-3">
                                        <FileCode className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{api.name}</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${api.status === 'Active' ? 'bg-[#1F7A5A]' : 'bg-slate-200'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

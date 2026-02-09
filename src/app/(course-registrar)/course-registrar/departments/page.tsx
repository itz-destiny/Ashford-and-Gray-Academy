"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    Shield,
    Database,
    Globe,
    Lock,
    Search,
    ChevronRight,
    ToggleLeft,
    Box,
    FileCode
} from "lucide-react";

export default function DepartmentSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Department Settings
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-full px-4">Institutional Config</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Configure academic departments, grading policies, and institutional metadata.</p>
                </div>
                <Button className="bg-slate-900 hover:bg-black text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95">
                    Save Variables
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-10 border-b border-slate-50">
                            <CardTitle className="text-2xl font-black text-slate-900 italic">Academic Logic</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Core System Parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            {[
                                { title: "Grading Scale", desc: "Define institutional pass marks and credit weights.", icon: Database, value: "4.0 Weighted" },
                                { title: "Admissions Hub", desc: "Enable automated enrollment for public certifications.", icon: Globe, value: "Public Enabled", active: true },
                                { title: "Module Gating", desc: "Require previous lesson completion before next access.", icon: Lock, value: "Hard Gating", active: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 group cursor-pointer hover:bg-slate-50/50 p-6 rounded-3xl transition-all border-2 border-transparent hover:border-slate-50">
                                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-slate-900 text-lg uppercase italic tracking-tight">{item.title}</h4>
                                            <Badge variant="outline" className="rounded-lg border-indigo-100 text-indigo-600 font-black text-[10px]">{item.value}</Badge>
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                    <div className="self-center">
                                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-10 border-b border-slate-50">
                            <CardTitle className="text-2xl font-black text-slate-900 italic">Faculty Structure</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Institutional Taxonomy</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid md:grid-cols-2 gap-4">
                                {["Computer Science", "Business School", "Finance & Fintech", "Social Sciences", "Digital Arts", "Institutional Core"].map((dept, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-indigo-600 hover:border-indigo-600 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Box className="w-4 h-4 text-slate-300 group-hover:text-indigo-200" />
                                            <span className="font-black text-slate-700 text-sm italic group-hover:text-white uppercase tracking-tight">{dept}</span>
                                        </div>
                                        <Settings className="w-4 h-4 text-slate-300 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                                <Button variant="outline" className="p-4 rounded-2xl border-dashed border-2 border-slate-200 text-slate-400 font-black text-sm italic hover:bg-slate-50 hover:border-slate-300 h-auto">
                                    + Add New Faculty
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] bg-indigo-900 text-white p-8 overflow-hidden relative group">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <Shield className="w-10 h-10 mb-6 opacity-40 text-indigo-200" />
                        <h3 className="text-2xl font-black mb-2 italic">Data Sovereignty</h3>
                        <p className="text-indigo-200/70 text-sm font-medium leading-relaxed mb-10">
                            Manage department visibility and student data routing across the institution's cloud infrastructure.
                        </p>
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black h-12 rounded-2xl uppercase tracking-widest text-xs backdrop-blur-sm">
                            Audit Security
                        </Button>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] p-10 bg-white space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-1 italic">API Integration</h3>
                            <p className="text-xs font-bold text-slate-400 tracking-tight">Sync department data with external LMS tools.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: "Webhooks", status: "Active" },
                                { name: "External Auth", status: "Disabled" },
                                { name: "Report Bridge", status: "Active" },
                            ].map((api, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <FileCode className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{api.name}</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${api.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

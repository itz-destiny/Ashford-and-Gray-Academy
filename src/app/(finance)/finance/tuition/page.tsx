"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    TrendingUp,
    Users,
    CreditCard,
    ArrowUpRight,
    Search,
    Filter,
    Download
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TuitionRevenuePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Tuition Revenue
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-full px-4">Live</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Monitoring academic fees, installments, and payment collections.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                        <Download className="w-4 h-4 mr-2" /> Export Report
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                        Generate Invoices
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", value: "₦42,850,000", trend: "+12.5%", icon: DollarSign, color: "bg-emerald-500" },
                    { label: "Pending Fees", value: "₦8,240,000", trend: "14 Students", icon: Clock, color: "bg-amber-500" },
                    { label: "Paid Today", value: "₦1,450,000", trend: "+₦240k", icon: TrendingUp, color: "bg-indigo-500" },
                    { label: "Scholarships", value: "₦3,200,000", trend: "Admin Approved", icon: GraduationCap, color: "bg-rose-500" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full">
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-10 border-b border-slate-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 leading-tight">Recent Collections</CardTitle>
                            <CardDescription className="text-slate-400 font-bold">Live transaction stream from the student portal.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Search students..." className="pl-10 h-11 bg-slate-50 border-none rounded-xl w-[260px] font-medium" />
                            </div>
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-100">
                                <Filter className="w-4 h-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Access</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Term</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { name: "Chidi Okafor", email: "chidi@student.ag.edu", course: "Advanced UX Design", amount: "₦250,000", method: "Bank Transfer", status: "Success", date: "2m ago" },
                                    { name: "Amara Bello", email: "amara@student.ag.edu", course: "Cybersecurity Ops", amount: "₦185,000", method: "Visa Card", status: "Success", date: "15m ago" },
                                    { name: "Tunde Edun", email: "tunde@student.ag.edu", course: "Strategic Management", amount: "₦320,000", method: "Mastercard", status: "Pending", date: "45m ago" },
                                    { name: "Zainab Musa", email: "zainab@student.ag.edu", course: "Digital Arts", amount: "₦150,000", method: "Verve Card", status: "Success", date: "1h ago" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500">
                                                    {row.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{row.name}</span>
                                                    <span className="text-xs text-slate-400 font-bold">{row.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{row.course}</span>
                                                <span className="text-xs text-slate-400 font-bold italic">Level 400 - Spring 2026</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 font-black text-slate-900">{row.amount}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                <CreditCard className="w-4 h-4 opacity-50" />
                                                {row.method}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <Badge className={
                                                row.status === "Success" ? "bg-emerald-100 text-emerald-700 border-none rounded-lg" :
                                                    "bg-amber-100 text-amber-700 border-none rounded-lg"
                                            }>
                                                {row.status}
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-white group-hover:shadow-sm">
                                                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { Clock, GraduationCap } from 'lucide-react';

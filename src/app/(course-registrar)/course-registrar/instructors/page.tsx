"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Mail,
    Phone,
    Star,
    Award,
    BookOpen,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    UserPlus,
    ArrowUpRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function InstructorsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Faculty & Instructors
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-full px-4">Institutional</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage academic credentials, course assignments, and instructor performance.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                    <UserPlus className="w-4 h-4 mr-2" /> Add New Instructor
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-sm shadow-slate-100 border border-slate-50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search by name, dept or expertise..." className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500 shadow-sm font-medium" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-11 px-4 bg-slate-50 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-100 transition-colors">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Filter Dept</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { name: "Dr. Sarah Chen", title: "Senior Fellow, AI Research", dept: "Computer Science", courses: 4, rating: 4.9, avatar: "" },
                    { name: "Prof. James Wilson", title: "Head of Marketing Strategy", dept: "Business School", courses: 3, rating: 4.7, avatar: "" },
                    { name: "Elena Rodriguez", title: "Lead Financial Analyst", dept: "Finance & Fintech", courses: 5, rating: 4.8, avatar: "" },
                    { name: "Dr. Michael Ade", title: "Professor of Modern Ethics", dept: "Social Sciences", courses: 2, rating: 4.5, avatar: "" },
                    { name: "Zoe Maxwell", title: "Senior Creative Director", dept: "Digital Arts", courses: 3, rating: 4.6, avatar: "" },
                    { name: "David Thorne", title: "PhD, Quantum Computing", dept: "Science & Eng.", courses: 1, rating: 4.9, avatar: "" },
                    { name: "Amara Bello", title: "Master of Cyber Ops", dept: "Cybersecurity", courses: 4, rating: 4.7, avatar: "" },
                    { name: "Tunde Edun", title: "Executive MBA, Dean", dept: "Leadership", courses: 2, rating: 4.8, avatar: "" },
                ].map((inst, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm mb-4 ring-1 ring-slate-100 transition-transform group-hover:scale-110 duration-500">
                                    <AvatarImage src={inst.avatar} />
                                    <AvatarFallback className="bg-slate-900 text-white font-black text-xl italic">
                                        {inst.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase italic">{inst.name}</h3>
                                <p className="text-xs font-bold text-slate-400 mb-4">{inst.title}</p>

                                <Badge className="bg-indigo-50 text-indigo-700 border-none rounded-lg px-3 py-1 mb-6 text-[10px] font-black uppercase">
                                    {inst.dept}
                                </Badge>

                                <div className="grid grid-cols-2 gap-4 w-full mb-8 pt-6 border-t border-slate-50">
                                    <div className="flex flex-col gap-1 items-center justify-center">
                                        <div className="flex items-center gap-1 text-slate-900 font-black">
                                            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                            {inst.courses}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courses</span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-center justify-center">
                                        <div className="flex items-center gap-1 text-slate-900 font-black">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            {inst.rating}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full">
                                    <Button variant="outline" className="flex-1 rounded-xl h-10 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
                                        <Mail className="w-3.5 h-3.5 mr-2 opacity-50" /> Message
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

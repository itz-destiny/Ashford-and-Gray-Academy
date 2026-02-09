"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Mail,
    Star,
    BookOpen,
    Search,
    Filter,
    UserPlus,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Instructor {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    title?: string;
    expertise?: string[];
    organization?: string;
}

export default function InstructorsPage() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users?role=instructor');
            const data = await res.json();
            setInstructors(data || []);
        } catch (error) {
            console.error('Error fetching instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInstructors = instructors.filter(inst =>
        inst.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.expertise?.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Faculty & Instructors
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-full px-4">
                            {instructors.length} Active
                        </Badge>
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
                    <Input
                        placeholder="Search by name, dept or expertise..."
                        className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500 shadow-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-11 px-4 bg-slate-50 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Filter Dept</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
            ) : filteredInstructors.length === 0 ? (
                <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] p-20 text-center">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No instructors found</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredInstructors.map((inst) => (
                        <Card key={inst.uid} className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm mb-4 ring-1 ring-slate-100 transition-transform group-hover:scale-110 duration-500">
                                        <AvatarImage src={inst.photoURL} />
                                        <AvatarFallback className="bg-slate-900 text-white font-black text-xl italic">
                                            {inst.displayName?.split(' ').map(n => n[0]).join('') || 'I'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase italic">
                                        {inst.displayName || 'Instructor'}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 mb-4">{inst.title || 'Faculty Member'}</p>

                                    {inst.organization && (
                                        <Badge className="bg-indigo-50 text-indigo-700 border-none rounded-lg px-3 py-1 mb-6 text-[10px] font-black uppercase">
                                            {inst.organization}
                                        </Badge>
                                    )}

                                    {inst.expertise && inst.expertise.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                                            {inst.expertise.slice(0, 3).map((skill, i) => (
                                                <Badge key={i} variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded-md">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 w-full mt-auto pt-6 border-t border-slate-50">
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
            )}
        </div>
    );
}

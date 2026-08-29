"use client";

import { apiFetch } from "@/lib/api-client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Mail,
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
            const res = await apiFetch('/api/users?role=instructor');
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
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Programme Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Faculty <span className="text-[#C8A96A]">& Instructors.</span>
                        <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10 rounded-none px-3 font-black text-[10px] uppercase tracking-widest">
                            {instructors.length} Active
                        </Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Manage academic credentials, course assignments, and instructor performance.</p>
                </div>
                <Button className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                    <UserPlus className="w-4 h-4 mr-2" /> Add New Instructor
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, dept or expertise..."
                        className="pl-10 h-11 bg-[#F6F4F2] border-none rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A] font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-11 px-4 bg-[#F6F4F2] flex items-center gap-3 border border-transparent hover:border-[#0B1F3A]/10 transition-colors cursor-pointer">
                        <Filter className="w-4 h-4 text-[#C8A96A]" />
                        <span className="text-xs font-black text-[#0B1F3A] uppercase tracking-widest">Filter Dept</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
            ) : filteredInstructors.length === 0 ? (
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-20 text-center">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold font-serif">No instructors found</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredInstructors.map((inst) => (
                        <div key={inst.uid} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="p-8">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-24 w-24 rounded-none border border-[#0B1F3A]/10 mb-4 transition-transform group-hover:scale-105 duration-500">
                                        <AvatarImage src={inst.photoURL} />
                                        <AvatarFallback className="bg-[#0B1F3A] text-white font-black text-xl rounded-none">
                                            {inst.displayName?.split(' ').map(n => n[0]).join('') || 'I'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-serif text-[#0B1F3A] leading-tight mb-1 group-hover:text-[#C8A96A] transition-colors">
                                        {inst.displayName || 'Instructor'}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 mb-4">{inst.title || 'Faculty Member'}</p>

                                    {inst.organization && (
                                        <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/20 rounded-none px-3 py-1 mb-6 text-[10px] font-black uppercase">
                                            {inst.organization}
                                        </Badge>
                                    )}

                                    {inst.expertise && inst.expertise.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                                            {inst.expertise.slice(0, 3).map((skill, i) => (
                                                <Badge key={i} variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded-none border-[#0B1F3A]/10">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 w-full mt-auto pt-6 border-t border-[#0B1F3A]/5">
                                        <Button variant="outline" className="flex-1 rounded-none h-10 border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] hover:bg-[#F6F4F2] shadow-none">
                                            <Mail className="w-3.5 h-3.5 mr-2 text-[#C8A96A]" /> Message
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none hover:bg-[#F6F4F2] hover:text-[#C8A96A] transition-colors">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

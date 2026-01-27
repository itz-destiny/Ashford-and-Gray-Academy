"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@/firebase";
import { BookOpen, MoreVertical, Plus, Search, Users, Star, Clock, Filter, Layers } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorCoursesPage() {
    const { user } = useUser();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;
        const fetchCourses = async () => {
            try {
                // Strictly filter by instructor name. 
                // Note: The API should ideally handle this server-side, 
                // but we're reinforcing it here as requested.
                const url = `/api/courses?instructorName=${encodeURIComponent(user.displayName || '')}`;
                const res = await fetch(url);
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Safety frontend filter just in case API returns more
                    const mine = data.filter(c => c.instructor?.name === user.displayName);
                    setCourses(mine);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user]);

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                        Curriculum Management
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Oversee your educational offerings and track academic engagement.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 px-8 rounded-2xl shadow-none gap-2 transition-all hover:scale-105 active:scale-95">
                        <Link href="/instructor/courses/new">
                            <Plus className="w-5 h-5" />
                            Develop New Course
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-none bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col gap-6 md:flex-row">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Search your curriculum..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 h-14 bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-lg font-medium rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white shadow-none font-bold text-slate-600 gap-2">
                                <Filter className="w-4 h-4" />
                                Refine
                            </Button>
                            <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white shadow-none font-bold text-slate-600 gap-2">
                                <Layers className="w-4 h-4" />
                                Categories
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="border-none shadow-none rounded-3xl overflow-hidden animate-pulse">
                            <div className="h-48 bg-slate-100" />
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-8 w-full" />
                            </CardHeader>
                        </Card>
                    ))
                ) : filteredCourses.map((course) => (
                    <Card key={course._id} className="group border-none hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col border border-white/20 hover:-translate-y-2 shadow-none">
                        <div className="relative h-48 overflow-hidden bg-slate-200">
                            <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-white/90 backdrop-blur text-slate-900 font-black border-none px-3 py-1 shadow-none">
                                    {course.category}
                                </Badge>
                            </div>
                        </div>
                        <CardHeader className="flex-1 pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    {course.rating} ({course.reviews})
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                                    <Clock className="w-3.5 h-3.5" />
                                    {course.duration}h
                                </div>
                            </div>
                            <CardTitle className="text-xl font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                {course.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-xl">
                                        <Users className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Cohort</p>
                                        <p className="font-bold text-slate-700">124 Students</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
                                    <p className="font-bold text-emerald-600">${(course.price * 124).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0 border-t border-slate-50 mt-auto">
                            <div className="flex gap-2 pt-6">
                                <Button asChild className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-xl shadow-none transition-all active:scale-95">
                                    <Link href={`/instructor/courses/${course._id}`}>Manage Content</Link>
                                </Button>
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

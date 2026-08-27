"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { BookOpen, Search, Users, Star, Clock } from "lucide-react";
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
                // Authenticated GET returns all statuses for elevated callers, so
                // instructor drafts come through. Filter to ones owned by this user.
                const res = await apiFetch('/api/courses');
                const data = await res.json();
                if (Array.isArray(data)) {
                    const mine = data.filter((c: any) =>
                        c.instructorUid === user.uid || c.instructor?.name === user.displayName
                    );
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
        <div className="mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 space-y-10 md:space-y-16 pb-32 max-w-[1600px] bg-[#FAF9F6]">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Faculty Portal</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
                    My <span className="text-[#C8A96A]">Teaching.</span>
                </h1>
                <p className="text-slate-500 font-medium text-base md:text-lg max-w-lg leading-relaxed font-serif">
                    Your assigned classes — manage content, track engagement, and run live sessions.
                </p>
            </div>

            {/* Search */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0B1F3A]/30 group-focus-within:text-[#C8A96A] transition-colors" />
                <Input
                    placeholder="Search your curriculum..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14 bg-white border border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A] text-base font-medium shadow-sm"
                />
            </div>

            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="border-none shadow-none rounded-none overflow-hidden animate-pulse">
                            <div className="h-48 bg-slate-100" />
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-8 w-full" />
                            </CardHeader>
                        </Card>
                    ))
                ) : filteredCourses.length === 0 ? (
                    <div className="col-span-full p-16 md:p-20 text-center bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] shadow-sm">
                        <div className="w-16 h-16 bg-[#F6F4F2] border border-[#0B1F3A]/10 flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-serif text-[#0B1F3A] mb-3">No courses yet</h3>
                        <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed font-serif">
                            You haven't been assigned to teach any courses yet. Contact the Registry if you believe this is a mistake.
                        </p>
                    </div>
                ) : filteredCourses.map((course) => (
                    <Card key={course._id} className="group border border-[#0B1F3A]/10 hover:border-[#C8A96A] transition-all duration-500 bg-white rounded-none overflow-hidden flex flex-col shadow-sm border-t-4 border-t-[#C8A96A]">
                        <div className="relative h-44 overflow-hidden bg-[#F6F4F2]">
                            <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-white/90 text-[#0B1F3A] font-black text-[9px] uppercase tracking-widest border-none rounded-none px-3 py-1">
                                    {course.category}
                                </Badge>
                            </div>
                        </div>
                        <CardHeader className="flex-1 pb-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-1.5 text-[#C8A96A] font-black text-[10px] uppercase tracking-widest">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    {course.rating} ({course.reviews})
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                    <Clock className="w-3.5 h-3.5" />
                                    {course.duration}h
                                </div>
                            </div>
                            <CardTitle className="text-xl font-serif text-[#0B1F3A] line-clamp-2 leading-snug group-hover:text-[#C8A96A] transition-colors">
                                {course.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-4 h-4 text-[#0B1F3A]" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p>
                                    <p className="font-bold text-[#0B1F3A] text-sm">{course.enrollmentCount ?? 0} Students</p>
                                </div>
                            </div>
                            {course.status && course.status !== 'published' && (
                                <Badge className="mt-3 bg-amber-50 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest rounded-none px-2.5 py-0.5">
                                    {course.status}
                                </Badge>
                            )}
                        </CardContent>
                        <div className="p-6 pt-0 border-t border-[#0B1F3A]/5 mt-auto">
                            <Button asChild className="w-full bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black h-11 rounded-none shadow-none text-[10px] uppercase tracking-widest transition-colors">
                                <Link href={`/instructor/courses/${course._id}`}>Manage</Link>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

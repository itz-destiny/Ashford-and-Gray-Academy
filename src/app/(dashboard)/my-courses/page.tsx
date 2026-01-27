"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import type { Enrollment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen, Clock, Award, Play, ChevronRight, Search, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function MyCoursesPage() {
  const { user, loading: userLoading } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchEnrollments = async () => {
      try {
        const res = await fetch(`/api/enrollments?userId=${user.uid}`);
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  const filteredEnrollments = enrollments.filter(en =>
    en.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inProgress = filteredEnrollments.filter(en => (en.course?.progress || 0) < 100);
  const completed = filteredEnrollments.filter(en => (en.course?.progress || 0) === 100);

  if (userLoading || (loading && enrollments.length === 0)) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-48 bg-slate-50 rounded-[40px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 md:px-10 py-8 space-y-10 max-w-[1600px] animate-in fade-in duration-700">

      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Learning Journey</h1>
          <p className="text-slate-500 font-medium">Manage your active courses and track your academic progress.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="bg-white border-slate-100 border p-4 rounded-2xl flex items-center gap-4 min-w-[160px]">
            <div className="bg-indigo-50 p-3 rounded-xl"><BookOpen className="w-5 h-5 text-indigo-600" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</p>
              <p className="text-xl font-black text-slate-900">{enrollments.length}</p>
            </div>
          </div>
          <div className="bg-white border-slate-100 border p-4 rounded-2xl flex items-center gap-4 min-w-[160px]">
            <div className="bg-emerald-50 p-3 rounded-xl"><Award className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
              <p className="text-xl font-black text-slate-900">{enrollments.filter(en => (en.course?.progress || 0) === 100).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resume Course */}
      {inProgress.length > 0 && (
        <Card className="border-none bg-slate-900 rounded-[40px] overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent z-0" />
          <CardContent className="p-10 relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="relative w-full md:w-64 h-40 rounded-3xl overflow-hidden">
              <Image
                src={inProgress[0].course?.imageUrl || ""}
                alt="Continue Learning"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-slate-900 scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <Badge className="bg-indigo-500/20 text-indigo-400 border-none px-3 py-1 font-black text-[10px] tracking-widest">RESUME LEARNING</Badge>
                <h2 className="text-3xl font-black text-white leading-tight">{inProgress[0].course?.title}</h2>
                <div className="flex items-center justify-center md:justify-start gap-4 text-indigo-300 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 12h remaining</span>
                  <span>•</span>
                  <span>{inProgress[0].course?.category}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end text-xs font-black text-indigo-400 uppercase tracking-widest">
                  <span>Current Progress</span>
                  <span>{inProgress[0].course?.progress}%</span>
                </div>
                <Progress value={inProgress[0].course?.progress} className="h-2 bg-white/10" />
              </div>

              <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 font-black h-12 px-10 rounded-2xl group/btn">
                <Link href={`/my-courses/${inProgress[0].id}`}>
                  Continue Lecture <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Filterable Section */}
      <Tabs defaultValue="all" className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-200/50">
            <TabsTrigger value="all" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-black text-xs uppercase tracking-tight">All Courses</TabsTrigger>
            <TabsTrigger value="active" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-black text-xs uppercase tracking-tight">In Progress</TabsTrigger>
            <TabsTrigger value="completed" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-none font-black text-xs uppercase tracking-tight">Completed</TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-100 rounded-2xl text-sm font-medium focus-visible:ring-indigo-100"
            />
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <CourseGrid items={filteredEnrollments} />
        </TabsContent>
        <TabsContent value="active" className="m-0">
          <CourseGrid items={inProgress} />
        </TabsContent>
        <TabsContent value="completed" className="m-0">
          <CourseGrid items={completed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourseGrid({ items }: { items: Enrollment[] }) {
  if (items.length === 0) {
    return (
      <div className="py-24 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
        <div className="max-w-xs mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No courses found</h3>
          <p className="text-slate-400 font-medium text-sm">You haven't enrolled in any courses that match this view.</p>
          <Button asChild variant="outline" className="rounded-xl border-slate-200">
            <Link href="/courses">Explore Catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {items.map((en) => (
        <Card key={en.id} className="group border-none bg-white rounded-[32px] overflow-hidden flex flex-col border border-slate-50 hover:-translate-y-2 transition-all duration-500">
          <div className="relative h-48">
            <Image
              src={en.course?.imageUrl || ""}
              alt={en.course?.title || ""}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/90 backdrop-blur text-slate-900 font-black text-[9px] uppercase tracking-widest border-none px-3 py-1">
                {en.course?.category}
              </Badge>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col space-y-6">
            <h3 className="font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{en.course?.title}</h3>

            <div className="space-y-3 mt-auto">
              <div className="flex justify-between items-end text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Course Progress</span>
                <span className="text-indigo-600">{en.course?.progress || 0}%</span>
              </div>
              <Progress value={en.course?.progress} className="h-1.5 bg-slate-50" />
            </div>

            <Button asChild variant="outline" className="w-full h-11 rounded-xl border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
              <Link href={`/my-courses/${en.id}`}>
                {en.course?.progress === 100 ? "Review Material" : "Continue Lesson"}
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

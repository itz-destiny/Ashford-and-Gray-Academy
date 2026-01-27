"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Search, SlidersHorizontal, Video, Presentation, Code, FileArchive, ArrowUpRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('/api/resources');
        const data = await res.json();
        if (Array.isArray(data)) {
          setResources(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || r.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getResourceTypeIcon = (type: string) => {
    const ICON_CLASS = "h-10 w-10 transition-transform group-hover:scale-110 duration-300";
    switch (type.toUpperCase()) {
      case 'PDF':
        return <FileText className={`${ICON_CLASS} text-rose-500`} />;
      case 'VIDEO':
        return <Video className={`${ICON_CLASS} text-sky-500`} />;
      case 'SLIDES':
        return <Presentation className={`${ICON_CLASS} text-amber-500`} />;
      case 'CODE':
        return <Code className={`${ICON_CLASS} text-emerald-500`} />;
      default:
        return <FileArchive className={`${ICON_CLASS} text-slate-400`} />;
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FileArchive className="w-8 h-8 text-indigo-600" />
            Institutional Assets
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Access highly curated academic materials and scholarly resources.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-none transition-all rounded-full px-6">
            Latest Additions
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-none bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Query scholarly archives..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-lg font-medium rounded-2xl"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[220px] h-14 bg-white border-slate-100 shadow-none rounded-2xl font-bold text-slate-700">
                  <SelectValue placeholder="Manifest Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  <SelectItem value="all" className="font-bold py-3">All Archives</SelectItem>
                  <SelectItem value="pdf" className="font-bold py-3">PDF Manuscripts</SelectItem>
                  <SelectItem value="video" className="font-bold py-3">Cinematic Lectures</SelectItem>
                  <SelectItem value="slides" className="font-bold py-3">Visual Presentations</SelectItem>
                  <SelectItem value="code" className="font-bold py-3">Computational Source</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 hover:bg-slate-50 shadow-none transition-all">
                <SlidersHorizontal className="h-5 w-5 text-slate-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-100" />
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
            </Card>
          ))
        ) : filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <Card key={resource.id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col border border-white/20 hover:-translate-y-2 active:scale-95">
              <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur shadow-sm p-2 rounded-full">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-none transform group-hover:rotate-12 transition-transform duration-500">
                  {getResourceTypeIcon(resource.type)}
                </div>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardHeader className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-tighter border-none px-2 py-0.5">
                    {resource.type}
                  </Badge>
                  <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(resource.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </div>
                <CardTitle className="text-lg font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-slate-400 text-[11px] font-bold mt-2 uppercase tracking-tight truncate">
                  {resource.courseId?.title || 'General Curriculum'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 p-6">
                <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold h-12 rounded-xl transition-all shadow-none gap-2">
                  <Download className="h-4 w-4" />
                  Download Asset
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200/50 select-none">
            <div className="flex flex-col items-center gap-6 opacity-40">
              <div className="bg-white p-8 rounded-full shadow-none">
                <Search className="w-16 h-16 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">No Materials Found</h3>
                <p className="text-slate-500 font-bold max-w-sm mx-auto">Our archives do not currently contain any assets matching your criteria. Try refining your parameters.</p>
              </div>
              <Button variant="ghost" className="font-black text-indigo-600 hover:bg-indigo-50" onClick={() => { setSearch(""); setFilterType("all"); }}>
                Clear Persistent Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

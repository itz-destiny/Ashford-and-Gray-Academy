"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Search, SlidersHorizontal, Video, Presentation, Code, FileArchive } from "lucide-react";
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
    const ICON_CLASS = "h-9 w-9 transition-transform group-hover:scale-110 duration-300 text-[#0B1F3A]";
    switch (type.toUpperCase()) {
      case 'PDF':
        return <FileText className={ICON_CLASS} />;
      case 'VIDEO':
        return <Video className={ICON_CLASS} />;
      case 'SLIDES':
        return <Presentation className={ICON_CLASS} />;
      case 'CODE':
        return <Code className={ICON_CLASS} />;
      default:
        return <FileArchive className={ICON_CLASS} />;
    }
  }

  return (
    <div className="mx-auto px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1800px] bg-[#FAF9F6] animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-[#C8A96A]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Study Materials</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#0B1F3A] tracking-tight leading-tight">
            Course <span className="text-[#C8A96A]">Resources.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed font-serif">
            Curated materials from your instructors — readings, slides, and recordings.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border border-[#0B1F3A]/10 rounded-none shadow-md bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#C8A96A] transition-colors" />
              <Input
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 bg-[#F6F4F2] border-none rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A] text-sm font-medium"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[220px] h-14 bg-white border border-[#0B1F3A]/10 shadow-sm rounded-none font-bold text-[#0B1F3A]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#0B1F3A]/10 shadow-xl">
                  <SelectItem value="all" className="font-bold py-3">All Types</SelectItem>
                  <SelectItem value="pdf" className="font-bold py-3">PDF Documents</SelectItem>
                  <SelectItem value="video" className="font-bold py-3">Video Lectures</SelectItem>
                  <SelectItem value="slides" className="font-bold py-3">Presentations</SelectItem>
                  <SelectItem value="code" className="font-bold py-3">Source Files</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-none border border-[#0B1F3A]/10 hover:bg-[#F6F4F2] shadow-sm transition-all">
                <SlidersHorizontal className="h-5 w-5 text-[#0B1F3A]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border border-[#0B1F3A]/10 rounded-none overflow-hidden animate-pulse">
              <div className="h-40 bg-slate-100" />
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
            </Card>
          ))
        ) : filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <Card key={resource.id} className="group border border-[#0B1F3A]/10 rounded-none shadow-sm hover:shadow-md hover:border-[#C8A96A] transition-all duration-300 bg-white overflow-hidden flex flex-col">
              <div className="relative h-40 bg-[#F6F4F2] flex items-center justify-center border-b border-[#0B1F3A]/10">
                <div className="bg-white p-6 border border-[#0B1F3A]/5 shadow-sm">
                  {getResourceTypeIcon(resource.type)}
                </div>
              </div>
              <CardHeader className="flex-1 pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <Badge className="bg-[#F6F4F2] text-slate-500 font-black text-[9px] uppercase tracking-widest border border-[#0B1F3A]/5 rounded-none px-2 py-0.5">
                    {resource.type}
                  </Badge>
                  <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(resource.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="text-lg font-serif text-[#0B1F3A] line-clamp-2 leading-tight group-hover:text-[#C8A96A] transition-colors">
                  {resource.title}
                </h3>
                <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-wider truncate">
                  {resource.courseId?.title || 'General Curriculum'}
                </p>
              </CardHeader>
              <CardContent className="pt-0 p-6">
                <Button className="w-full bg-[#0B1F3A] hover:bg-[#C8A96A] text-white font-black h-12 rounded-none transition-all shadow-none gap-2 text-[10px] uppercase tracking-widest">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white border border-[#0B1F3A]/10 rounded-none border-t-4 border-t-[#C8A96A] shadow-md">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-[#F6F4F2] border border-[#0B1F3A]/10 rounded-none shadow-sm flex items-center justify-center text-slate-300">
                <Search className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-[#0B1F3A]">No Materials Found</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed font-serif">No resources currently match your criteria. Try refining your search.</p>
              </div>
              <Button variant="ghost" className="font-black text-[#0B1F3A] hover:bg-[#F6F4F2] hover:text-[#C8A96A] uppercase tracking-widest text-[10px]" onClick={() => { setSearch(""); setFilterType("all"); }}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

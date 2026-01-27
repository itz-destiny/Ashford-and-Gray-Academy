"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Video, Presentation, Code, FileArchive, ArrowUpRight, Upload, Trash2, Download, MoreVertical, FolderPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

    const getResourceTypeIcon = (type: string) => {
        const ICON_CLASS = "h-8 w-8 transition-transform group-hover:scale-110 duration-300";
        switch (type.toUpperCase()) {
            case 'PDF': return <FileText className={`${ICON_CLASS} text-rose-500`} />;
            case 'VIDEO': return <Video className={`${ICON_CLASS} text-sky-500`} />;
            case 'SLIDES': return <Presentation className={`${ICON_CLASS} text-amber-500`} />;
            case 'CODE': return <Code className={`${ICON_CLASS} text-emerald-500`} />;
            default: return <FileArchive className={`${ICON_CLASS} text-slate-400`} />;
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <FileArchive className="w-8 h-8 text-indigo-600" />
                        Educational Repository
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage, curate, and distribute scholarly assets across your academic cohorts.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="font-bold border-slate-200 h-11 px-6 rounded-xl gap-2 shadow-sm">
                        <FolderPlus className="w-4 h-4" />
                        Archive Structure
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-none gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Manuscript
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-none bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col gap-6 md:flex-row">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Query institutional assets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 h-14 bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-lg font-medium rounded-2xl"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6">
                <Card className="border-none shadow-none bg-white/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest pl-10">Asset Identification</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Classification</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Deployment Course</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Temporal Marker</th>
                                    <th className="p-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-6 pl-10"><Skeleton className="h-6 w-48" /></td>
                                            <td className="p-6"><Skeleton className="h-4 w-16" /></td>
                                            <td className="p-6"><Skeleton className="h-4 w-32" /></td>
                                            <td className="p-6"><Skeleton className="h-4 w-24" /></td>
                                            <td className="p-6 text-right pr-10"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredResources.length > 0 ? (
                                    filteredResources.map((resource) => (
                                        <tr key={resource._id} className="group hover:bg-slate-50/50 transition-colors duration-300">
                                            <td className="p-6 pl-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-none border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                                        {getResourceTypeIcon(resource.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{resource.title}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Scholarly Asset Registry: {resource._id.slice(-8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase border-none px-2 py-0.5">
                                                    {resource.type}
                                                </Badge>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-xs font-bold text-slate-600">{resource.courseId?.title || 'General Curriculum'}</p>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-xs font-bold text-slate-400">{new Date(resource.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </td>
                                            <td className="p-6 text-right pr-10">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center opacity-30 select-none">
                                            <div className="flex flex-col items-center gap-4">
                                                <FileArchive className="w-16 h-16 text-slate-300" />
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">Neutral Archive</p>
                                                    <p className="text-sm font-bold text-slate-500">No organizational assets found in the current registry.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}

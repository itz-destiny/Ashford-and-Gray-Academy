"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    GraduationCap,
    Users,
    Wallet,
    UserCircle,
    Search,
    Loader2,
    Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { logAudit, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface SponsoredStudent {
    uid: string;
    displayName: string;
    email: string;
    sponsor: string;
    courseTitle: string;
    value: number;
}

interface SponsorSummary {
    sponsor: string;
    studentCount: number;
    totalValue: number;
}

const fmtNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

export default function ScholarshipsPage() {
    const [students, setStudents] = useState<SponsoredStudent[]>([]);
    const [sponsors, setSponsors] = useState<SponsorSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editTarget, setEditTarget] = useState<SponsoredStudent | null>(null);
    const [editSponsor, setEditSponsor] = useState('');
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/finance/scholarships');
            const data = await res.json();
            if (res.ok) {
                setStudents(data.students || []);
                setSponsors(data.sponsors || []);
            }
        } catch (err) {
            console.error('Error fetching scholarships:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = students.filter(s =>
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalValue = students.reduce((sum, s) => sum + s.value, 0);

    const openEdit = (student: SponsoredStudent) => {
        setEditTarget(student);
        setEditSponsor(student.sponsor);
    };

    const handleSaveSponsor = async () => {
        if (!editTarget) return;
        setSaving(true);
        try {
            const res = await apiFetch('/api/finance/scholarships', {
                method: 'PATCH',
                body: JSON.stringify({ uid: editTarget.uid, sponsor: editSponsor.trim() }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to update sponsor.');
            }
            await logAudit({
                action: AUDIT_ACTIONS.USER_UPDATED,
                resource: AUDIT_RESOURCES.USER,
                resourceId: editTarget.uid,
                metadata: { field: 'sponsor', from: editTarget.sponsor, to: editSponsor.trim(), student: editTarget.email },
            });
            toast({ title: "Sponsor Updated", description: `${editTarget.displayName}'s sponsor has been updated.` });
            setEditTarget(null);
            fetchData();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Financial Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-4">
                        Scholarships
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Students sponsored under the Flagship Cohort, by individual or foundation.</p>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Sponsored Students", value: students.length.toString(), icon: GraduationCap },
                    { label: "Sponsors / Foundations", value: sponsors.length.toString(), icon: Users },
                    { label: "Total Sponsored Value", value: fmtNaira(totalValue), icon: Wallet },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8 group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                            <stat.icon className="w-5 h-5 text-[#C8A96A]" />
                        </div>
                        <p className="text-3xl font-serif text-[#0B1F3A]">{loading ? '—' : stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Per-sponsor summary */}
            {sponsors.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                    {sponsors.map((s) => (
                        <div key={s.sponsor} className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-6">
                            <p className="text-white font-serif text-lg mb-1">{s.sponsor}</p>
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest">{s.studentCount} student{s.studentCount === 1 ? '' : 's'} · {fmtNaira(s.totalValue)}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Student list */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-serif text-[#0B1F3A]">Sponsored Students</h2>
                        <p className="text-slate-400 font-medium text-sm mt-1">Real sponsor assignments from the Flagship Cohort master list.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search students or sponsors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-11 bg-white border border-[#0B1F3A]/10 rounded-none w-[260px] focus-visible:ring-[#C8A96A]"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F6F4F2] text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-[#0B1F3A]/10">
                            <tr>
                                <th className="px-8 py-4">Student</th>
                                <th className="px-6 py-4">Sponsor</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4 text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0B1F3A]/5">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-serif italic">No sponsored students found</td></tr>
                            ) : filtered.map((s) => (
                                <tr key={s.uid} className="hover:bg-[#F6F4F2]/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#F6F4F2] border border-[#0B1F3A]/5 flex items-center justify-center font-black text-[#C8A96A]">
                                                <UserCircle className="w-6 h-6 opacity-30" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-[#0B1F3A]">{s.displayName}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{s.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-medium text-slate-700">{s.sponsor}</td>
                                    <td className="px-6 py-5">
                                        <Badge variant="outline" className="rounded-none font-black border-[#0B1F3A]/10 text-slate-600 bg-white">
                                            {s.courseTitle}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5 font-black text-[#0B1F3A]">{fmtNaira(s.value)}</td>
                                    <td className="px-6 py-5 text-right pr-8">
                                        <Button size="icon" variant="ghost" onClick={() => openEdit(s)} className="rounded-none hover:bg-[#F6F4F2]">
                                            <Pencil className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-none border-[#0B1F3A]/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-[#0B1F3A]">Edit Sponsor</DialogTitle>
                        <DialogDescription>Update {editTarget?.displayName}'s sponsor. Leave blank to remove sponsorship.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="sponsor">Sponsor / Foundation</Label>
                        <Input
                            id="sponsor"
                            value={editSponsor}
                            onChange={(e) => setEditSponsor(e.target.value)}
                            className="h-11 rounded-none border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A] mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditTarget(null)} className="rounded-none font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                        <Button onClick={handleSaveSponsor} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black rounded-none px-8 h-11 text-[10px] uppercase tracking-widest shadow-none">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

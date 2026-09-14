"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export interface AccountRow {
    uid: string;
    displayName: string;
    email: string;
    role: string;
    roleTitle: string;
    createdAt: string;
    lastSignInTime: string | null;
    hasLoggedIn: boolean;
}

const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || "??";

/**
 * Shared "list of accounts + real login status" view, reused for the
 * Instructors, Students, and (indirectly, via a name match) EMC admin
 * pages — one table, one data source (/api/admin/users/login-status),
 * with the reset action opt-in per page since only Instructors needs it.
 */
export function AccountsTable({ role, showReset = false }: { role: string; showReset?: boolean }) {
    const [rows, setRows] = useState<AccountRow[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [loginFilter, setLoginFilter] = useState<"all" | "logged_in" | "not_logged_in">("all");
    const [resettingUid, setResettingUid] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchRows = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/admin/users/login-status?role=${role}`);
            const data = await res.json().catch(() => ({}));
            if (data?.success && Array.isArray(data.users)) setRows(data.users);
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to load accounts." });
        } finally {
            setLoading(false);
        }
    }, [role, toast]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    const handleReset = async (uid: string, email: string) => {
        setResettingUid(uid);
        try {
            const res = await apiFetch(`/api/admin/users/${uid}/reset`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Reset failed");
            toast({ title: "Reset & sent", description: `A new temporary password and magic login link were emailed to ${email}.` });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Reset Failed", description: err.message });
        } finally {
            setResettingUid(null);
        }
    };

    const filtered = (rows || []).filter((r) => {
        const matchesSearch = r.displayName?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase());
        const matchesLogin = loginFilter === "all" || (loginFilter === "logged_in" ? r.hasLoggedIn : !r.hasLoggedIn);
        return matchesSearch && matchesLogin;
    });

    const loggedInCount = (rows || []).filter((r) => r.hasLoggedIn).length;
    const total = rows?.length ?? 0;

    return (
        <div className="space-y-8">
            {!loading && rows && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <button
                        onClick={() => setLoginFilter("all")}
                        className={cn("text-left p-6 bg-white border shadow-sm transition-colors",
                            loginFilter === "all" ? "border-[#0B1F3A] border-t-4 border-t-[#0B1F3A]" : "border-[#0B1F3A]/10 border-t-4 border-t-transparent")}
                    >
                        <p className="text-3xl font-black text-[#0B1F3A]">{total}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total</p>
                    </button>
                    <button
                        onClick={() => setLoginFilter("logged_in")}
                        className={cn("text-left p-6 bg-white border shadow-sm transition-colors",
                            loginFilter === "logged_in" ? "border-[#1F7A5A] border-t-4 border-t-[#1F7A5A]" : "border-[#0B1F3A]/10 border-t-4 border-t-transparent")}
                    >
                        <p className="text-3xl font-black text-[#1F7A5A]">{loggedInCount}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Logged In</p>
                    </button>
                    <button
                        onClick={() => setLoginFilter("not_logged_in")}
                        className={cn("text-left p-6 bg-white border shadow-sm transition-colors",
                            loginFilter === "not_logged_in" ? "border-amber-600 border-t-4 border-t-amber-600" : "border-[#0B1F3A]/10 border-t-4 border-t-transparent")}
                    >
                        <p className="text-3xl font-black text-amber-600">{total - loggedInCount}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1.5"><XCircle className="w-3 h-3" /> Not Logged In</p>
                    </button>
                </div>
            )}

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="px-8 py-6 border-b border-[#0B1F3A]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchRows} className="h-11 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A]">
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 font-serif italic">No accounts match.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#0B1F3A]/5">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-8 py-5">Name</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Login Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</TableHead>
                                {showReset && <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((r) => (
                                <TableRow key={r.uid} className="hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                    <TableCell className="pl-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{getInitials(r.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-[#0B1F3A]">{r.displayName}</div>
                                                <div className="text-xs text-slate-400">{r.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {r.hasLoggedIn ? (
                                            <div>
                                                <Badge className="rounded-none font-black text-[9px] uppercase tracking-wider bg-emerald-50 text-emerald-700 border-none">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Logged In
                                                </Badge>
                                                {r.lastSignInTime && (
                                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(r.lastSignInTime).toLocaleString()}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge className="rounded-none font-black text-[9px] uppercase tracking-wider bg-amber-50 text-amber-700 border-none">
                                                <XCircle className="w-3 h-3 mr-1" /> Not Logged In
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                                    </TableCell>
                                    {showReset && (
                                        <TableCell className="text-right pr-8">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReset(r.uid, r.email)}
                                                disabled={resettingUid === r.uid}
                                                className="rounded-none text-[#0B1F3A] hover:text-[#1F7A5A] hover:bg-[#1F7A5A]/5 font-black text-[10px] uppercase tracking-widest"
                                            >
                                                {resettingUid === r.uid ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <RotateCcw className="h-4 w-4 mr-1.5" />}
                                                Reset
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

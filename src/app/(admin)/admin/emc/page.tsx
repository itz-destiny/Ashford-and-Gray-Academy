"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { LEADERSHIP } from "@/lib/leadership-data";
import type { AccountRow } from "@/components/admin/AccountsTable";

const HONORIFICS = /\b(dr|mr|mrs|ms|esq|comrade|barrister|phd)\b\.?/gi;

function normalize(name: string): Set<string> {
    return new Set(
        name
            .toLowerCase()
            .replace(HONORIFICS, "")
            .replace(/[.,()]/g, "")
            .split(/\s+/)
            .filter((w) => w.length > 1)
    );
}

/** Real accounts only ever get matched by name — never assumed from a slug. */
function findMatch(leaderName: string, accounts: AccountRow[]): AccountRow | null {
    const target = normalize(leaderName);
    let best: AccountRow | null = null;
    let bestOverlap = 0;
    for (const acc of accounts) {
        const candidate = normalize(acc.displayName);
        const overlap = [...target].filter((w) => candidate.has(w)).length;
        if (overlap > bestOverlap && overlap >= 2) {
            bestOverlap = overlap;
            best = acc;
        }
    }
    return best;
}

export default function AdminEmcPage() {
    const [accounts, setAccounts] = useState<AccountRow[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/admin/users/login-status?role=all")
            .then((res) => res.json())
            .then((data) => { if (data?.success) setAccounts(data.users); })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="px-6 md:px-12 py-12 space-y-10 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Master Control</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">Executive Leadership.</h1>
                <p className="text-slate-500 font-medium font-serif">
                    The public EMC listing, cross-checked against real platform accounts by name — some leadership members don't hold a login at all, and that's expected.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-16">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" />
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LEADERSHIP.map((leader) => {
                        const match = accounts ? findMatch(leader.name, accounts) : null;
                        return (
                            <Card key={leader.slug} className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none overflow-hidden">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="w-14 h-14 relative shrink-0 rounded-full overflow-hidden bg-slate-100 border border-[#0B1F3A]/10">
                                        <Image src={leader.photo} alt={leader.name} fill className="object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div>
                                            <p className="font-bold text-[#0B1F3A] leading-tight truncate">{leader.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{leader.title}</p>
                                        </div>
                                        {match ? (
                                            <div>
                                                <Badge className={
                                                    "rounded-none font-black text-[9px] uppercase tracking-wider border-none " +
                                                    (match.hasLoggedIn ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")
                                                }>
                                                    {match.hasLoggedIn ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                    {match.hasLoggedIn ? "Logged In" : "Not Logged In"}
                                                </Badge>
                                                <p className="text-[10px] text-slate-400 mt-1 truncate">{match.email} &middot; {match.roleTitle}</p>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="rounded-none font-black text-[9px] uppercase tracking-wider text-slate-400 border-slate-200">
                                                <MinusCircle className="w-3 h-3 mr-1" /> No Platform Account
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

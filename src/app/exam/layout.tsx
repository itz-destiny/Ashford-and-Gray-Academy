"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, LogOut, Clock } from "lucide-react";
import { useUser } from "@/firebase";
import { signInWithToken, signOut } from "@/firebase/auth";
import "../globals.css";

interface ExamInfo {
    title: string;
    type: string;
    courseTitle: string | null;
    durationMinutes: number;
    opensAt: string;
    closesAt: string;
}

const WAT: Intl.DateTimeFormatOptions = { timeZone: "Africa/Lagos", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" };

function friendlyAuthError(message: string): string {
    if (/invalid-credential|wrong-password|user-not-found|invalid-email/i.test(message)) {
        return "That email and password don't match. Use the same details you use for the academy portal.";
    }
    if (/too-many-requests/i.test(message)) return "Too many attempts. Wait a minute, then try again.";
    if (/network/i.test(message)) return "No internet connection. Check your connection and try again.";
    return "Could not sign you in. Please try again.";
}

/**
 * A direct exam link (/exam/:id). Students open it, sign in with their
 * academy email and password, and land on that exam on its own — no
 * dashboard, no menus. The exam pages themselves are the same ones the
 * dashboard uses, so every exam rule (live room, lockdown, warnings) applies.
 */
export default function ExamLinkLayout({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const { user, loading } = useUser();
    const [info, setInfo] = useState<ExamInfo | null>(null);
    const [infoError, setInfoError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/assessments/${id}/public`)
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "This exam is not available.");
                setInfo(data);
            })
            .catch(err => setInfoError(err.message));
    }, [id]);

    if (loading) {
        return <Splash text="Loading your exam…" />;
    }

    if (!user) {
        return <SignIn examId={String(id)} info={info} infoError={infoError} />;
    }

    const role = (user as any).role as string | undefined;
    const name = (user as any).displayName || (user as any).name || user.email || "";

    if (role !== "student") {
        return (
            <Shell info={info} name={name}>
                <div className="max-w-md mx-auto mt-24 bg-white p-8 text-center space-y-4 border border-slate-200">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <p className="font-serif text-xl text-[#0B1F3A]">This link is for students</p>
                    <p className="text-sm text-slate-600">
                        You're signed in as {user.email}{role ? ` (${role.replace(/_/g, " ")})` : ""}. To take this exam, sign out and sign in with the student's account.
                    </p>
                    {role === "instructor" || role === "admin" ? (
                        <Button asChild variant="outline" className="rounded-none">
                            <Link href={role === "admin" ? `/admin/tests/${id}/proctor` : `/instructor/tests/${id}/proctor`}>Go to Live Proctoring</Link>
                        </Button>
                    ) : null}
                </div>
            </Shell>
        );
    }

    return <Shell info={info} name={name}>{children}</Shell>;
}

function Shell({ info, name, children }: { info: ExamInfo | null; name: string; children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <header className="sticky top-0 z-30 bg-[#0B1F3A] text-white border-t-4 border-t-[#C8A96A]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Ashford &amp; Gray Fusion Academy</p>
                        <p className="text-sm font-bold truncate">{info?.title ?? "Examination"}</p>
                    </div>
                    <span className="hidden sm:block text-xs text-white/70 truncate max-w-[14rem]">{name}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void signOut()}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-none text-xs font-bold"
                    >
                        <LogOut className="w-4 h-4 mr-1.5" /> Sign out
                    </Button>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        </div>
    );
}

function SignIn({ examId, info, infoError }: { examId: string; info: ExamInfo | null; infoError: string | null }) {
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            const res = await fetch(`/api/assessments/${encodeURIComponent(examId)}/email-access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.token) throw new Error(data.error || "Could not sign you in. Please try again.");
            const { error: err } = await signInWithToken(data.token);
            if (err) throw new Error(friendlyAuthError(err));
            // useUser picks up the session and the exam renders.
        } catch (err: any) {
            setError(/fetch|network/i.test(err?.message || "") ? "No internet connection. Check your connection and try again." : err?.message);
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] px-4 py-10">
            <div className="w-full max-w-sm bg-white p-8 space-y-6 border-t-4 border-[#C8A96A]">
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">
                        {info?.type === "exam" ? "Examination" : "Assessment"}
                    </p>
                    {info ? (
                        <>
                            <p className="font-serif text-xl text-[#0B1F3A] leading-snug">{info.title}</p>
                            {info.courseTitle && <p className="text-sm text-slate-500">{info.courseTitle}</p>}
                            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {info.durationMinutes} min · opens {new Date(info.opensAt).toLocaleString("en-GB", WAT)}
                            </p>
                        </>
                    ) : infoError ? (
                        <p className="text-sm text-rose-600">{infoError}</p>
                    ) : (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                    )}
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <Input
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        inputMode="email"
                        placeholder="Your academy email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="h-12 rounded-none"
                    />
                    {error && (
                        <div className="flex items-start gap-2 text-rose-600 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={busy}
                        className="w-full h-12 bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-xs uppercase tracking-widest rounded-none"
                    >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go to my exam"}
                    </Button>
                </form>

                <p className="text-center text-xs text-slate-500">Enter the email you registered with the academy.</p>
            </div>
        </div>
    );
}

function Splash({ text }: { text: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A]">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">{text}</span>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

/**
 * Blocks the real student dashboard until at least one enrollment exists.
 * Applying no longer requires payment up front (see /api/applications) — this
 * is what actually prevents an unpaid applicant from getting a working
 * dashboard, since a bare account with no enrollment sees this screen instead.
 */
export function EnrollmentGate({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<"loading" | "empty" | "enrolled">("loading");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiFetch("/api/enrollments");
                const data = await res.json();
                if (cancelled) return;
                setStatus(Array.isArray(data) && data.length > 0 ? "enrolled" : "empty");
            } catch {
                if (!cancelled) setStatus("empty");
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (status === "loading") {
        return (
            <div
                style={{
                    display: "flex",
                    minHeight: "60vh",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                }}
            >
                Loading your dashboard…
            </div>
        );
    }

    if (status === "empty") {
        return (
            <div className="flex flex-col items-center justify-center text-center px-6 py-32 min-h-[60vh]">
                <div className="w-16 h-16 bg-[#0B1F3A]/5 flex items-center justify-center mb-8">
                    <GraduationCap className="w-8 h-8 text-[#0B1F3A]" />
                </div>
                <h1 className="text-3xl font-serif text-[#0B1F3A] tracking-tight mb-4">Complete Your Enrollment</h1>
                <p className="text-slate-500 font-medium max-w-md leading-relaxed mb-10">
                    Your application is on file, but your dashboard unlocks once you've enrolled in a programme.
                    Choose a course and complete payment to get started.
                </p>
                <Button asChild className="h-14 px-10 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors">
                    <Link href="/courses">Browse Programmes</Link>
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}

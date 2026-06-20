"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

export default function MeetingIndexPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [status, setStatus] = useState("Locating your live room…");

    useEffect(() => {
        if (loading || !user) return;

        const go = async () => {
            try {
                const res = await apiFetch("/api/courses");
                const all = await res.json();
                const uid = (user as any).uid;
                const name = (user as any).displayName;
                const mine = Array.isArray(all)
                    ? all.filter((c: any) => c.instructorUid === uid || c.instructor?.name === name)
                    : [];

                if (mine.length > 0) {
                    const id = mine[0]._id || mine[0].id;
                    router.replace(`/meeting/course-${id}`);
                } else {
                    setStatus("No courses assigned. Ask an admin to create one.");
                }
            } catch {
                setStatus("Could not load courses. Please try again.");
            }
        };

        go();
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1F3A] text-white gap-6">
            <Loader2 className="w-10 h-10 animate-spin text-[#C8A96A]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                {status}
            </p>
        </div>
    );
}

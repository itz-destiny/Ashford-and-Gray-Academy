"use client";

import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PORTAL_BY_ROLE: Record<string, string> = {
    admin: "/admin",
    registrar: "/registrar",
    course_registrar: "/course-registrar",
    finance: "/finance",
    instructor: "/instructor",
    student: "/dashboard",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace(`/login?redirectUrl=${encodeURIComponent(pathname || "/account")}`);
        }
    }, [user, loading, router, pathname]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A]">
                <span className="text-[11px] font-black tracking-[0.3em] text-[#C8A96A] uppercase">Loading…</span>
            </div>
        );
    }

    const portal = PORTAL_BY_ROLE[(user as any).role] || "/dashboard";

    return (
        <div className="min-h-screen bg-[#FCFCFE]">
            <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-white/80 backdrop-blur-md px-6 md:px-10 border-b border-slate-100">
                <Button asChild variant="ghost" className="rounded-2xl">
                    <Link href={portal}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        <span className="text-sm font-bold">Back to {portal === "/dashboard" ? "Dashboard" : portal.replace("/", "").replace("-", " ")}</span>
                    </Link>
                </Button>
                <div className="ml-auto flex items-center gap-3">
                    <NotificationBell />
                    <UserNav />
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    );
}

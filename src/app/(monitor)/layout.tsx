"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Logo } from "@/components/logo";
import { signOut } from "@/firebase/auth";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

// Dedicated monitor accounts run on a phone pinned to this one screen — no
// sidebar, no navigation, nothing else to tap. Just their assigned slot's
// live status and a way to sign out. An admin using this as their IT
// dashboard gets extra tabs (User Lookup, plus quick links into the other
// portals) that a plain monitor account never sees.
export default function MonitorLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const pathname = usePathname();
    const isAdmin = user?.role === "admin";

    return (
        <RoleGuard allowed={["live_monitor", "admin"]}>
            <div className="min-h-screen w-full bg-[#0B1F3A] flex flex-col">
                <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <Logo variant="white" />
                    {isAdmin && (
                        <nav className="hidden md:flex items-center gap-1">
                            <MonitorNavLink href="/monitor" active={pathname === "/monitor"}>Live Classes</MonitorNavLink>
                            <MonitorNavLink href="/monitor/users" active={pathname === "/monitor/users"}>User Lookup</MonitorNavLink>
                            <span className="mx-2 h-4 w-px bg-white/10" />
                            <MonitorNavLink href="/admissions">Admissions</MonitorNavLink>
                            <MonitorNavLink href="/registrar">Registrar</MonitorNavLink>
                            <MonitorNavLink href="/admin">Admin</MonitorNavLink>
                        </nav>
                    )}
                    <button
                        onClick={async () => { await signOut(); window.location.href = '/login'; }}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </header>
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
            </div>
        </RoleGuard>
    );
}

function MonitorNavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={cn(
                "px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                active ? "text-[#C8A96A]" : "text-white/50 hover:text-white"
            )}
        >
            {children}
        </Link>
    );
}

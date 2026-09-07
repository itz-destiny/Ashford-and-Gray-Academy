"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Logo } from "@/components/logo";
import { signOut } from "@/firebase/auth";
import { LogOut } from "lucide-react";

// Dedicated monitor accounts run on a phone pinned to this one screen — no
// sidebar, no navigation, nothing else to tap. Just their assigned slot's
// live status and a way to sign out.
export default function MonitorLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowed={["live_monitor"]}>
            <div className="min-h-screen w-full bg-[#0B1F3A] flex flex-col">
                <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <Logo variant="white" />
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

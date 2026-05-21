
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
    Home,
    Users,
    Book,
    Calendar,
    MessageSquare,
    Settings,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    BarChart3,
    Mail
} from "lucide-react";
import { useUser } from "@/firebase";
import { signOut } from "@/firebase/auth";

const navItems = [
    { href: "/admin", label: "Academy Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Members & Staff", icon: Users },
    { href: "/admin/courses", label: "Course Catalog", icon: Book },
    { href: "/admin/events", label: "Academy Events", icon: Calendar },
    { href: "/admin/communications", label: "Messages", icon: MessageSquare },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    { href: "/admin/reports", label: "Insights", icon: BarChart3 },
];

export function AdminSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 flex flex-col z-50",
            className
        )}>
            <div className="p-10 pb-12">
                <Logo />
            </div>

            <nav className="flex-1 px-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Master Control</p>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-500",
                                isActive
                                    ? "bg-[#0B1F3A] text-white shadow-2xl shadow-blue-900/10"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-[#0B1F3A]"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-all duration-500",
                                isActive ? "text-[#C8A96A] scale-110" : "text-slate-300 group-hover:text-[#0B1F3A] group-hover:scale-110"
                            )} />
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto">
                                    <div className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full animate-pulse shadow-[0_0_8px_rgba(200,169,106,0.8)]" />
                                </div>
                            )}
                        </Link>
                    );
                })}

                <div className="pt-10">
                    <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">System</p>
                    <Link
                        href="/admin/settings"
                        className={cn(
                            "group flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-500",
                            pathname === "/admin/settings" ? "bg-[#0B1F3A] text-white" : "text-slate-400 hover:bg-slate-50 hover:text-[#0B1F3A]"
                        )}
                    >
                        <Settings className={cn("w-5 h-5", pathname === "/admin/settings" ? "text-[#C8A96A]" : "text-slate-300 group-hover:text-[#0B1F3A]")} />
                        <span className="text-sm font-bold tracking-tight">Academy Settings</span>
                    </Link>
                </div>
            </nav>

            <div className="p-8 mt-auto border-t border-slate-50">
                <div className="flex items-center gap-4 px-4 py-4 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-blue-900/20">
                        {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('') : 'AD'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-[#0B1F3A] truncate">{user?.displayName || "Admin User"}</p>
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-wider mt-0.5">Super Admin</p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        await signOut();
                        window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

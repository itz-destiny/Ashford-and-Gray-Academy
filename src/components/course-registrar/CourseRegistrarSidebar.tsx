"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
    BookOpen, Users, MessageSquare, Settings,
    LayoutDashboard, LogOut, TrendingUp, Sparkles,
} from "lucide-react";
import { useUser } from "@/firebase";
import { signOut } from "@/firebase/auth";

const navItems = [
    { href: "/course-registrar",                label: "Programme Home",    icon: LayoutDashboard },
    { href: "/course-registrar/courses",        label: "Academy Programmes", icon: BookOpen },
    { href: "/course-registrar/students",       label: "Student List",      icon: Users },
    { href: "/course-registrar/communications", label: "My Messages",       icon: MessageSquare },
    { href: "/course-registrar/analytics",      label: "Performance",       icon: TrendingUp },
];

export function CourseRegistrarSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen w-72 bg-[#0B1F3A] border-r border-white/5 flex flex-col z-50",
            className
        )}>
            <div className="p-8 pb-12">
                <Logo variant="white" />
            </div>

            <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Programme Office</p>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-4 px-5 py-3.5 transition-all duration-300 relative rounded-none",
                                isActive
                                    ? "bg-white/5 text-[#C8A96A] border-l-4 border-[#C8A96A]"
                                    : "text-white/60 hover:bg-white/[0.02] hover:text-white"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4 h-4 transition-all duration-300",
                                isActive
                                    ? "text-[#C8A96A] scale-110"
                                    : "text-white/40 group-hover:text-white group-hover:scale-110"
                            )} />
                            <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto">
                                    <div className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full animate-pulse shadow-[0_0_8px_rgba(200,169,106,0.8)]" />
                                </div>
                            )}
                        </Link>
                    );
                })}

                <div className="pt-8">
                    <p className="px-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">System</p>
                    <Link
                        href="/course-registrar/settings"
                        className={cn(
                            "group flex items-center gap-4 px-5 py-3.5 transition-all duration-300 rounded-none",
                            pathname === "/course-registrar/settings"
                                ? "bg-white/5 text-[#C8A96A] border-l-4 border-[#C8A96A]"
                                : "text-white/60 hover:bg-white/[0.02] hover:text-white"
                        )}
                    >
                        <Settings className={cn(
                            "w-4 h-4",
                            pathname === "/course-registrar/settings" ? "text-[#C8A96A]" : "text-white/40 group-hover:text-white"
                        )} />
                        <span className="text-xs font-black uppercase tracking-wider">Account Settings</span>
                    </Link>
                </div>
            </nav>

            <div className="p-6 mt-auto">
                <div className="bg-white/[0.03] border border-white/10 border-t-2 border-t-[#C8A96A] rounded-none p-6 relative overflow-hidden group mb-4">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:rotate-12">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.2em] mb-1">Signed In As</p>
                    <p className="text-white text-sm font-black truncate">{user?.displayName || "Programme Manager"}</p>
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-wider mt-0.5">Academy Programmes</p>
                </div>
                <button
                    onClick={async () => { await signOut(); window.location.href = '/login'; }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-none text-white/60 hover:bg-white/[0.02] hover:text-white/90 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform text-white/40 group-hover:text-white" />
                    <span className="text-xs font-black uppercase tracking-wider">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

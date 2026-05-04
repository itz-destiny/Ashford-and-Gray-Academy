
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
    Home,
    BookOpen,
    Calendar,
    GraduationCap,
    MessageSquare,
    FileText,
    Clock,
    LayoutDashboard,
    LogOut,
    ChevronRight,
    Sparkles
} from "lucide-react";

const sidebarItems = [
    { href: "/dashboard", label: "Executive Dashboard", icon: Home },
    { href: "/my-courses", label: "Academic Programs", icon: BookOpen },
    { href: "/my-events", label: "Institutional Events", icon: Calendar },
    { href: "/grades", label: "Performance Metrics", icon: GraduationCap },
    { href: "/communications", label: "Academic Dialogue", icon: MessageSquare },
    { href: "/resources", label: "Knowledge Base", icon: FileText },
    { href: "/schedule", label: "Academic Agenda", icon: Clock },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-50 flex flex-col z-50",
            className
        )}>
            {/* Sidebar Header */}
            <div className="p-8 pb-12">
                <Logo />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Core Curriculum</p>

                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500",
                                isActive
                                    ? "bg-[#0B1F3A] text-white shadow-xl shadow-blue-900/10"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-[#0B1F3A]"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-all duration-500",
                                isActive ? "text-[#C8A96A] scale-110" : "text-slate-300 group-hover:text-[#0B1F3A] group-hover:scale-110"
                            )} />
                            <span className="font-serif text-sm tracking-tight font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto">
                                    <div className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full animate-pulse shadow-[0_0_8px_rgba(200,169,106,0.8)]" />
                                </div>
                            )}
                        </Link>
                    );
                })}

                <div className="pt-10">
                    <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Support Registry</p>
                    <Link
                        href="/help"
                        className={cn(
                            "group flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500",
                            pathname === "/help" ? "bg-[#0B1F3A] text-white" : "text-slate-400 hover:bg-slate-50 hover:text-[#0B1F3A]"
                        )}
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            <div className={cn("w-2 h-2 rounded-full transition-all duration-500", pathname === "/help" ? "bg-[#C8A96A]" : "bg-slate-300 group-hover:bg-[#1F7A5A]")} />
                        </div>
                        <span className="font-serif text-sm tracking-tight font-medium">Institutional Help</span>
                        <ChevronRight size={14} className={cn("ml-auto transition-all duration-500", pathname === "/help" ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
                    </Link>
                </div>
            </nav>

            {/* Sidebar Footer / User Banner */}
            <div className="p-6 mt-auto">
                <div className="bg-gradient-to-br from-[#0B1F3A] to-[#1F7A5A] rounded-[2.5rem] p-7 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:rotate-12">
                        <Sparkles className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.2em] mb-3">Academic Excellence</p>
                    <p className="text-white text-sm font-serif leading-snug mb-5">Elevate your studies with our global community.</p>
                    <button className="w-full py-3.5 bg-white text-[#0B1F3A] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#C8A96A] hover:text-white transition-all shadow-lg active:scale-95">
                        Join Discussion
                    </button>
                </div>
            </div>
        </aside>
    );
}

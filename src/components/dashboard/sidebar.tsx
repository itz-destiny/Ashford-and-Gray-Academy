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
    ChevronRight
} from "lucide-react";

const sidebarItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/my-courses", label: "Courses", icon: BookOpen },
    { href: "/my-events", label: "Events", icon: Calendar },
    { href: "/grades", label: "Grades", icon: GraduationCap },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/resources", label: "Resources", icon: FileText },
    { href: "/schedule", label: "Schedule", icon: Clock },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 flex flex-col z-50",
            className
        )}>
            {/* Sidebar Header */}
            <div className="p-8 pb-12">
                <Logo />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Menu</p>

                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform group-hover:scale-110 duration-300",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                            )} />
                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                            )}
                        </Link>
                    );
                })}

                <div className="pt-8">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Support & Tools</p>
                    <Link
                        href="/help"
                        className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-300"
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">Need Help?</span>
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>
                </div>
            </nav>

            {/* Sidebar Footer / User Banner */}
            <div className="p-4 mt-auto">
                <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden group border border-slate-800">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutDashboard className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Join Our Discord</p>
                    <p className="text-white text-sm font-bold leading-snug mb-4">Join 2,000+ students in our active community</p>
                    <button className="w-full py-2.5 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-tight hover:bg-indigo-50 transition-colors">
                        Connect Now
                    </button>
                </div>
            </div>
        </aside>
    );
}


"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
    BookOpen,
    Calendar,
    GraduationCap,
    Home,
    MessageSquare,
    FileText,
    Clock,
    ChevronRight,
    Sparkles
} from "lucide-react";

const sidebarItems = [
    { href: "/dashboard", label: "My Home", icon: Home },
    { href: "/my-courses", label: "My Courses", icon: BookOpen },
    { href: "/my-events", label: "Academy Events", icon: Calendar },
    { href: "/grades", label: "My Grades", icon: GraduationCap },
    { href: "/communications", label: "My Messages", icon: MessageSquare },
    { href: "/resources", label: "Study Materials", icon: FileText },
    { href: "/schedule", label: "My Schedule", icon: Clock },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen w-72 bg-[#0B1F3A] border-r border-white/5 flex flex-col z-50",
            className
        )}>
            {/* Sidebar Header */}
            <div className="p-8 pb-12">
                <Logo variant="white" />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Learning</p>

                {sidebarItems.map((item) => {
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
                                isActive ? "text-[#C8A96A] scale-110" : "text-white/40 group-hover:text-white group-hover:scale-110"
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
                    <p className="px-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Support</p>
                    <Link
                        href="/help"
                        className={cn(
                            "group flex items-center gap-4 px-5 py-3.5 transition-all duration-300 rounded-none",
                            pathname === "/help"
                                ? "bg-white/5 text-[#C8A96A] border-l-4 border-[#C8A96A]"
                                : "text-white/60 hover:bg-white/[0.02] hover:text-white"
                        )}
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", pathname === "/help" ? "bg-[#C8A96A]" : "bg-white/30 group-hover:bg-white")} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider">Get Help</span>
                        <ChevronRight size={12} className={cn("ml-auto transition-all duration-300", pathname === "/help" ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
                    </Link>
                </div>
            </nav>

            {/* Sidebar Footer / User Banner */}
            <div className="p-6 mt-auto">
                <div className="bg-white/[0.03] border border-white/10 border-t-2 border-t-[#C8A96A] rounded-none p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:rotate-12">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.2em] mb-2">Academy Success</p>
                    <p className="text-white/80 text-[10px] font-medium leading-relaxed mb-4">Elevate your studies with our global collegiate registry.</p>
                    <Link
                        href="/communications"
                        className="block w-full py-3 bg-[#C8A96A] text-[#0B1F3A] hover:bg-[#B69759] text-[9px] font-black uppercase tracking-widest transition-all text-center text-xs"
                    >
                        Join Discussion
                    </Link>
                </div>
            </div>
        </aside>
    );
}

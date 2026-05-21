"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
    LayoutDashboard,
    DollarSign,
    Wallet,
    GraduationCap,
    BarChart3,
    LifeBuoy,
    MessageSquare,
    Settings,
    LogOut,
    Receipt,
} from "lucide-react";
import { useUser } from "@/firebase";
import { signOut } from "@/firebase/auth";

const navItems = [
    { href: "/finance",                label: "Finance Home",    icon: LayoutDashboard },
    { href: "/finance/transactions",   label: "Transactions",    icon: Receipt },
    { href: "/finance/tuition",        label: "Tuition",         icon: DollarSign },
    { href: "/finance/payouts",        label: "Payouts",         icon: Wallet },
    { href: "/finance/scholarships",   label: "Scholarships",    icon: GraduationCap },
    { href: "/finance/reports",        label: "Reports",         icon: BarChart3 },
    { href: "/finance/tickets",        label: "Support Tickets", icon: LifeBuoy },
    { href: "/finance/communications", label: "Messages",        icon: MessageSquare },
];

export function FinanceSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 flex flex-col z-50",
                className
            )}
        >
            <div className="p-10 pb-12">
                <Logo />
            </div>

            <nav className="flex-1 px-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">
                    Financial Office
                </p>

                {navItems.map(item => {
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
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-all duration-500",
                                    isActive
                                        ? "text-[#C8A96A] scale-110"
                                        : "text-slate-300 group-hover:text-[#0B1F3A] group-hover:scale-110"
                                )}
                            />
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
                    <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">
                        Settings
                    </p>
                    <Link
                        href="/finance/settings"
                        className={cn(
                            "group flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-500",
                            pathname === "/finance/settings"
                                ? "bg-[#0B1F3A] text-white"
                                : "text-slate-400 hover:bg-slate-50 hover:text-[#0B1F3A]"
                        )}
                    >
                        <Settings
                            className={cn(
                                "w-5 h-5",
                                pathname === "/finance/settings"
                                    ? "text-[#C8A96A]"
                                    : "text-slate-300 group-hover:text-[#0B1F3A]"
                            )}
                        />
                        <span className="text-sm font-bold tracking-tight">Account Settings</span>
                    </Link>
                </div>
            </nav>

            <div className="p-8 mt-auto border-t border-slate-50">
                <div className="flex items-center gap-4 px-4 py-4 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] flex items-center justify-center text-[#C8A96A] font-black text-xs uppercase shadow-lg shadow-blue-900/10">
                        {user?.displayName
                            ? user.displayName.split(' ').map(n => n[0]).join('')
                            : 'FI'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-[#0B1F3A] truncate">
                            {user?.displayName || "Finance Manager"}
                        </p>
                        <p className="text-[10px] font-black text-[#C8A96A] uppercase tracking-wider mt-0.5">
                            Tuition Office
                        </p>
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

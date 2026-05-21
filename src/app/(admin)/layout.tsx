"use client";

import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["admin"]}>
        <div className="flex min-h-screen w-full bg-[#FCFCFE]">
            <AdminSidebar className="hidden md:flex" />

            <div className="flex flex-col flex-1 md:pl-72">
                <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-white/80 backdrop-blur-md px-6 md:px-10 border-b border-slate-100">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 md:hidden text-slate-600"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-none w-72">
                            <AdminSidebar className="relative w-72" />
                        </SheetContent>
                    </Sheet>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-serif text-[#0B1F3A] font-bold tracking-tight truncate">
                            Management Suite
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden xs:block">
                            Ashford &amp; Gray Academy Control
                        </p>
                    </div>

                    <div className="hidden md:flex relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Find students or staff..."
                            className="w-full bg-slate-50 pl-10 border-none focus-visible:ring-2 focus-visible:ring-indigo-100 rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
                        <UserNav />
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-10 animate-in fade-in duration-700">
                    {children}
                </main>
            </div>
        </div>
        </RoleGuard>
    );
}

"use client";

import { UserNav } from "@/components/user-nav";
import {
    Search,
    Menu,
    Bell,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseRegistrarSidebar } from "@/components/course-registrar/CourseRegistrarSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function CourseRegistrarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["course_registrar"]}>
            <div className="flex min-h-screen w-full bg-[#FCFCFE]">
                <CourseRegistrarSidebar className="hidden md:flex" />

                <div className="flex flex-col flex-1 md:pl-72">
                    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-white/80 backdrop-blur-xl px-6 md:px-10 border-b border-slate-50">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 md:hidden text-[#0B1F3A] hover:bg-slate-50 rounded-xl"
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 border-none w-72">
                                <CourseRegistrarSidebar className="relative w-72" />
                            </SheetContent>
                        </Sheet>

                        <div className="flex items-center gap-4 mr-auto">
                            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                <Shield className="w-4 h-4 text-[#C8A96A]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0B1F3A]">
                                    Academy Management
                                </span>
                            </div>
                            <div className="flex flex-col md:hidden">
                                <h1 className="text-lg font-black text-[#0B1F3A] leading-tight">
                                    Study Plans
                                </h1>
                            </div>
                        </div>

                        <div className="hidden lg:flex relative w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#0B1F3A] transition-colors" />
                            <Input
                                type="search"
                                placeholder="Find classes..."
                                className="w-full bg-slate-50/50 pl-11 h-11 border-slate-100 focus-visible:ring-[#0B1F3A]/10 rounded-2xl transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-50 rounded-xl"
                            >
                                <Bell className="h-5 w-5" />
                            </Button>
                            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
                            <UserNav />
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-10 lg:p-12 animate-in fade-in duration-700">
                        <div className="max-w-[1600px] mx-auto">{children}</div>
                    </main>
                </div>
            </div>
        </RoleGuard>
    );
}

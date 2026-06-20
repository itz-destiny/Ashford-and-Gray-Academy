"use client";

import { UserNav } from "@/components/user-nav";
import { Search, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinanceSidebar } from "@/components/finance/FinanceSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RoleGuard } from "@/components/auth/RoleGuard";
import Link from "next/link";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowed={["finance"]}>
            <div className="flex min-h-screen w-full bg-[#FAF9F6]">
                <FinanceSidebar className="hidden md:flex" />

                <div className="flex flex-col flex-1 md:pl-72">
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-[#FAF9F6]/90 backdrop-blur-md px-6 md:px-10 border-t-4 border-t-[#C8A96A] border-b border-b-[#0B1F3A]/5">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-none">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 border-none w-72">
                                <FinanceSidebar className="relative w-72" />
                            </SheetContent>
                        </Sheet>

                        <div className="hidden lg:flex relative w-72 group ml-auto mr-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[#0B1F3A] transition-colors" />
                            <Input
                                type="search"
                                placeholder="Find transactions..."
                                className="w-full bg-white pl-9 h-10 border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A] rounded-none text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-3 ml-auto lg:ml-0">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#0B1F3A] hover:bg-[#0B1F3A]/5 rounded-none" asChild>
                                <Link href="/finance/settings"><Settings className="h-4 w-4" /></Link>
                            </Button>
                            <div className="h-6 w-px bg-[#0B1F3A]/10 hidden sm:block" />
                            <UserNav />
                        </div>
                    </header>

                    <main className="flex-1 animate-in fade-in duration-500">
                        {children}
                    </main>
                </div>
            </div>
        </RoleGuard>
    );
}

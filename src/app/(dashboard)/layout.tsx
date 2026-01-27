"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { UserNav } from "@/components/user-nav";
import {
  Bell,
  Settings,
  Search,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import "../globals.css";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-[#FCFCFE]">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      <div className="flex flex-col flex-1 md:pl-72">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-white/80 backdrop-blur-md px-6 md:px-10 border-b border-slate-100">
          {/* Mobile Sidebar Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-6 w-6 text-slate-600" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-none w-72">
              <Sidebar className="relative w-72" />
            </SheetContent>
          </Sheet>

          {/* Search Engine Area */}
          <div className="flex-1 flex justify-center max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                type="search"
                placeholder="Ask anything or find courses..."
                className="pl-12 w-full h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-100 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Action Icons & User Nav */}
          <div className="flex items-center gap-3 md:gap-5 ml-auto">
            <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-50 transition-colors relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>

            <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-50 transition-colors" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5 text-slate-600" />
              </Link>
            </Button>

            <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />

            <UserNav />
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 animate-in fade-in duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}


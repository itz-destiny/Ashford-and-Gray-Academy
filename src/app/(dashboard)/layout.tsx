"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { UserNav } from "@/components/user-nav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
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
import { RoleGuard } from "@/components/auth/RoleGuard";
import "../globals.css";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RoleGuard allowed={["student"]}>
    <div className="flex min-h-screen w-full bg-[#FAF9F6]">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      <div className="flex flex-col flex-1 md:pl-72">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-[#FAF9F6]/90 backdrop-blur-md px-6 md:px-10 border-t-4 border-t-[#C8A96A] border-b border-b-[#0B1F3A]/5">
          {/* Mobile Sidebar Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden hover:bg-[#0B1F3A]/5 rounded-none"
              >
                <Menu className="h-6 w-6 text-[#0B1F3A]" />
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0B1F3A]/40 group-focus-within:text-[#C8A96A] transition-colors" />
              <Input
                type="search"
                placeholder="Ask anything or find courses..."
                className="pl-12 w-full h-12 bg-white border border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A] transition-all text-sm font-medium shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.currentTarget.value;
                    if (query.trim()) {
                      window.location.href = `/courses?search=${encodeURIComponent(query.trim())}`;
                    } else {
                      window.location.href = `/courses`;
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Action Icons & User Nav */}
          <div className="flex items-center gap-3 md:gap-5 ml-auto">
            <NotificationBell />

            <Button variant="ghost" size="icon" className="rounded-none border border-[#0B1F3A]/10 bg-white hover:bg-[#0B1F3A]/5 transition-colors shadow-sm" asChild>
              <Link href="/account">
                <Settings className="h-5 w-5 text-[#0B1F3A]/60" />
              </Link>
            </Button>

            <div className="h-8 w-px bg-[#0B1F3A]/10 mx-2 hidden sm:block" />

            <UserNav />
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 animate-in fade-in duration-700">
          {children}
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}


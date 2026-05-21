
"use client";

import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import {
  Bell,
  Plus,
  Search,
  Menu,
  Shield
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <RoleGuard allowed={["instructor"]}>
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] bg-[#FCFCFE]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r border-slate-100 bg-white md:block sticky top-0 h-screen">
        <InstructorSidebar />
      </aside>

      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-20 items-center gap-4 bg-white/80 backdrop-blur-xl px-6 md:px-10 border-b border-slate-50">
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-[#0B1F3A] hover:bg-slate-50 rounded-xl">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-none w-80">
              <InstructorSidebar className="w-full" />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-4 mr-auto">
             <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <Shield className="w-4 h-4 text-[#C8A96A]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0B1F3A]">Academy Faculty</span>
             </div>
             <h1 className="text-xl font-black text-[#0B1F3A] md:hidden">Faculty</h1>
          </div>

          <div className="hidden lg:flex relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#0B1F3A] transition-colors" />
            <Input
              type="search"
              placeholder="Search classes, students..."
              className="w-full bg-slate-50/50 pl-12 h-11 border-slate-100 focus-visible:ring-[#0B1F3A]/10 rounded-2xl transition-all"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto lg:ml-0">
            <Button asChild className="bg-[#0B1F3A] hover:bg-slate-800 text-white rounded-xl gap-2 h-11 px-6 shadow-xl shadow-blue-900/10 transition-all active:scale-95">
              <Link href="/instructor/courses/new">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline font-bold">Add Lesson</span>
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-50 rounded-xl hidden sm:flex">
              <Bell className="h-5 w-5" />
            </Button>

            <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />

            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-black text-[#0B1F3A] leading-none">{user?.displayName || 'Faculty Member'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Instructor</p>
              </div>
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 lg:p-12">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}

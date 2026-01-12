
"use client";

import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import {
  Bell,
  Book,
  Calendar,
  Home,
  LineChart,
  MessageSquare,
  Plus,
  Search,
  Users,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/instructor", label: "Dashboard", icon: Home },
    { href: "/instructor/courses", label: "Courses", icon: Book },
    { href: "/instructor/events", label: "Events", icon: Calendar },
    { href: "/instructor/students", label: "Students", icon: Users },
    { href: "/instructor/messages", label: "Messages", icon: MessageSquare },
    { href: "/instructor/analytics", label: "Analytics", icon: LineChart },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
      <div className="hidden border-r bg-[#0f172a] text-white md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-md">
                <Logo showText={false} className="text-[#0f172a]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">Ashford & Gray</span>
                <span className="text-[0.6rem] uppercase opacity-70">Fusion Academy</span>
              </div>
            </Link>
          </div>
          <div className="flex-1 px-4 py-4">
            <nav className="grid items-start gap-2 text-sm font-medium">
              <div className="mb-4">
                <Link
                  href="/instructor"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 transition-all",
                    pathname === "/instructor" ? "bg-[#6366f1] text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <div className="bg-white/20 p-1 rounded text-white"><Home className="h-4 w-4" /></div>
                  Dashboard
                </Link>
              </div>

              {[
                { href: "/instructor/courses", label: "My Courses", icon: Book },
                { href: "/instructor/schedule", label: "Schedule", icon: Calendar },
                { href: "/instructor/students", label: "Students", icon: Users },
                { href: "/instructor/communications", label: "Communications", icon: MessageSquare },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    pathname === item.href ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="h-4 w-4 text-slate-400" />
                  {item.label}
                </Link>
              ))}

              <div className="mt-6">
                <div className="h-[1px] bg-slate-800 my-4" />
                <Link
                  href="/instructor/reports"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <LineChart className="h-4 w-4 text-slate-400" />
                  Reports
                </Link>
                <Link
                  href="/instructor/resources"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Book className="h-4 w-4 text-slate-400" />
                  Resources
                </Link>
              </div>

            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-xs text-slate-400 mb-2">Storage Usage</p>
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[75%]" />
              </div>
              <p className="text-[0.65rem] text-right text-slate-500 mt-1">7.5GB / 10GB</p>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-slate-400 hover:text-white hover:bg-white/10 justify-start px-2">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-[#f8fafc]">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
          <h1 className="text-xl font-bold text-slate-800 mr-auto">Instructor Portal</h1>

          <div className="hidden md:flex relative w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses, students..."
              className="w-full bg-slate-50 pl-9 border-slate-200 focus-visible:ring-indigo-500 rounded-full"
            />
          </div>

          <Button asChild className="bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-md gap-2">
            <Link href="/instructor/courses/new">
              <Plus className="h-4 w-4" /> New Material
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="text-slate-500">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="border-l pl-4 flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold leading-none">{useUser()?.user?.displayName || 'Instructor'}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
            <UserNav />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

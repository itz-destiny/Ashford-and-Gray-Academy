
"use client";

import { Logo } from "@/components/logo";
import {
  Book,
  Calendar,
  Home,
  LineChart,
  MessageSquare,
  Users,
  Settings,
  X,
  LayoutDashboard,
  Clock,
  FileText,
  Video,
  MonitorPlay
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InstructorSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const sidebarItems = [
    { href: "/instructor", label: "Overview", icon: LayoutDashboard },
    { href: "/instructor/courses", label: "My Teaching", icon: Book },
    { href: "/instructor/schedule", label: "Class Schedule", icon: Clock },
    { href: "/instructor/students", label: "My Students", icon: Users },
    { href: "/instructor/communications", label: "My Messages", icon: MessageSquare },
    { href: "/live-classes", label: "Live Room", icon: Video },
  ];

  return (
    <div className={cn("flex h-full max-h-screen flex-col gap-2 bg-white text-slate-900 border-r border-slate-100 shadow-sm", className)}>
      <div className="p-10 pb-12">
        <Logo />
      </div>
      
      <nav className="flex-1 px-8 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Faculty Menu</p>

        {sidebarItems.map((item) => {
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
              <item.icon className={cn(
                "w-5 h-5 transition-all duration-500",
                isActive ? "text-[#C8A96A] scale-110" : "text-slate-300 group-hover:text-[#0B1F3A] group-hover:scale-110"
              )} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {isActive && (
                <div className="ml-auto">
                  <div className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full animate-pulse shadow-[0_0_8px_rgba(200,169,106,0.8)]" />
                </div>
              )}
            </Link>
          );
        })}

        <div className="pt-10">
          <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Academy Tools</p>
          <Link
            href="/instructor/reports"
            className={cn(
              "group flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-500",
              pathname === "/instructor/reports" ? "bg-[#0B1F3A] text-white" : "text-slate-400 hover:bg-slate-50 hover:text-[#0B1F3A]"
            )}
          >
            <LineChart className={cn("w-5 h-5", pathname === "/instructor/reports" ? "text-[#C8A96A]" : "text-slate-300 group-hover:text-[#0B1F3A]")} />
            <span className="font-bold text-sm tracking-tight">Performance</span>
          </Link>
          <Link
            href="/instructor/resources"
            className={cn(
              "group flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-500",
              pathname === "/instructor/resources" ? "bg-[#0B1F3A] text-white" : "text-slate-400 hover:bg-slate-50 hover:text-[#0B1F3A]"
            )}
          >
            <FileText className={cn("w-5 h-5", pathname === "/instructor/resources" ? "text-[#C8A96A]" : "text-slate-300 group-hover:text-[#0B1F3A]")} />
            <span className="font-bold text-sm tracking-tight">Study Materials</span>
          </Link>
        </div>
      </nav>

      <div className="p-8 mt-auto space-y-6">
        <div className="bg-[#0B1F3A] rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <MonitorPlay className="w-4 h-4 text-[#C8A96A]" />
              <p className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.2em]">Storage</p>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-[#C8A96A] w-[75%] rounded-full shadow-[0_0_8px_rgba(200,169,106,0.5)]" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold">7.5GB of 10GB utilized</p>
          </div>
        </div>
        <Link
          href="/account"
          className="flex items-center gap-4 px-6 py-2 text-slate-400 hover:text-[#0B1F3A] transition-all group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-sm font-bold">Account Settings</span>
        </Link>
      </div>
    </div>
  );
}

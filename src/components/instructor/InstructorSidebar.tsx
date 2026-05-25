
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
    <div className={cn("flex h-full max-h-screen flex-col gap-2 bg-[#0B1F3A] text-white border-r border-white/5 shadow-sm", className)}>
      <div className="p-10 pb-12">
        <Logo variant="white" />
      </div>
      
      <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Faculty Menu</p>

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
          <p className="px-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Academy Tools</p>
          <Link
            href="/instructor/reports"
            className={cn(
              "group flex items-center gap-4 px-5 py-3.5 transition-all duration-300 rounded-none",
              pathname === "/instructor/reports" ? "bg-white/5 text-[#C8A96A] border-l-4 border-[#C8A96A]" : "text-white/60 hover:bg-white/[0.02] hover:text-white"
            )}
          >
            <LineChart className={cn("w-4 h-4 transition-all duration-300", pathname === "/instructor/reports" ? "text-[#C8A96A]" : "text-white/40 group-hover:text-white")} />
            <span className="text-xs font-black uppercase tracking-wider">Performance</span>
          </Link>
          <Link
            href="/instructor/resources"
            className={cn(
              "group flex items-center gap-4 px-5 py-3.5 transition-all duration-300 rounded-none",
              pathname === "/instructor/resources" ? "bg-white/5 text-[#C8A96A] border-l-4 border-[#C8A96A]" : "text-white/60 hover:bg-white/[0.02] hover:text-white"
            )}
          >
            <FileText className={cn("w-4 h-4 transition-all duration-300", pathname === "/instructor/resources" ? "text-[#C8A96A]" : "text-white/40 group-hover:text-white")} />
            <span className="text-xs font-black uppercase tracking-wider">Study Materials</span>
          </Link>
        </div>
      </nav>

      <div className="p-6 mt-auto space-y-4">
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-none p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <MonitorPlay className="w-4 h-4 text-[#C8A96A]" />
              <p className="text-[#C8A96A] text-[9px] font-black uppercase tracking-[0.2em]">Storage</p>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-none overflow-hidden mb-3">
              <div className="h-full bg-[#C8A96A] w-[75%] rounded-none shadow-[0_0_8px_rgba(200,169,106,0.5)]" />
            </div>
            <p className="text-[10px] text-white/50 font-medium">7.5GB of 10GB utilized</p>
          </div>
        </div>
        <Link
          href="/account"
          className="flex items-center gap-4 px-5 py-2 text-white/60 hover:text-white transition-all group"
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500 text-white/40 group-hover:text-white" />
          <span className="text-xs font-black uppercase tracking-wider">Account Settings</span>
        </Link>
      </div>
    </div>
  );
}

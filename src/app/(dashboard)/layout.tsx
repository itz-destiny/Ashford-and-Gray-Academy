"use client";

import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BookOpen,
  Calendar,
  Home,
  MessageSquare,
  ScrollText,
  Settings,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUser } from "@/lib/data";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/courses", icon: BookOpen, label: "Courses" },
    { href: "/live-classes", icon: Video, label: "Live Classes" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
    { href: "/resources", icon: ScrollText, label: "Resources" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const getPageTitle = () => {
    const item = navItems.find(item => item.href === pathname);
    if (pathname.startsWith('/courses/')) return 'Course Details';
    return item ? item.label : "Dashboard";
  };

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="mb-2" />
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
              <AvatarFallback>{getInitials(mockUser.name)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
              <p className="font-medium text-sm truncate">{mockUser.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{mockUser.email}</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
          {isMobile && <SidebarTrigger />}
          <div className="flex-1">
            <h1 className="text-lg font-semibold font-headline">{getPageTitle()}</h1>
          </div>
          <div className="ml-auto">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

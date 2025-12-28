
"use client";

import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider,
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
import "../globals.css";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

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
    if (item) return item.label;
    
    // Handle nested routes like /courses/[id]
    if (pathname.startsWith('/courses/')) return 'Courses';
    if (pathname.startsWith('/live-classes')) return 'Live Classes';

    return "Dashboard";
  };

  return (
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar side="left" collapsible="icon" className="border-r bg-muted/20 hidden md:flex">
              <SidebarHeader>
                <Logo />
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {navItems.filter(item => item.href !== '/settings').map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                          tooltip={item.label}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                 <SidebarMenu className="mt-auto">
                   {navItems.filter(item => item.href === '/settings').map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          isActive={pathname.startsWith(item.href)}
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
                <UserNav />
              </SidebarFooter>
            </Sidebar>
            <div className="flex-1 flex flex-col">
              <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
                {isMobile && (
                  <SidebarTrigger>
                    <Sidebar side="left" collapsible="offcanvas" className="border-r bg-muted/20">
                        <SidebarHeader>
                          <Logo />
                        </SidebarHeader>
                        <SidebarContent>
                          <SidebarMenu>
                            {navItems.map((item) => (
                              <SidebarMenuItem key={item.href}>
                                <Link href={item.href}>
                                  <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
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
                          <UserNav />
                        </SidebarFooter>
                      </Sidebar>
                  </SidebarTrigger>
                )}
                <div className="flex-1">
                  <h1 className="text-lg font-semibold font-headline">{getPageTitle()}</h1>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <UserNav />
                </div>
              </header>
              <main className="flex-1 p-4 md:p-6 bg-muted/30">
                  {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
  );
}

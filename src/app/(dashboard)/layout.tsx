
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
  Info,
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
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";


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
    // Exact match for dashboard pages
    const item = navItems.find(item => item.href === pathname);
    if (item) return item.label;

    // Handle nested course pages
    if (pathname.startsWith('/courses/')) return 'Explore Our Courses';
    
    return "Dashboard";
  };

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar side="left" collapsible="icon" className="border-r bg-muted/20 hidden md:flex">
                <SidebarHeader>
                  <Logo />
                </SidebarHeader>
                <SidebarContent>
                  <SidebarMenu>
                    {navItems.slice(0, 6).map((item) => (
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
                     {navItems.slice(6).map((item) => (
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
                  <div className="ml-auto">
                    <UserNav />
                  </div>
                </header>
                <main className="flex-1 p-4 md:p-6 bg-muted/30">
                    {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

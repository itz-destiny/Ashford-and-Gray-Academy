
"use client";

import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import {
    Bell,
    Book,
    Calendar,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Plus,
    Search,
    Settings,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/courses", label: "Courses", icon: Book },
        { href: "/admin/events", label: "Events", icon: Calendar },
        { href: "/admin/reports", label: "Reports", icon: MessageSquare }, // Using MessageSquare as placeholder for Reports icon if BarChart is not desired or redundant
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
            <div className="hidden border-r bg-white md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-20 items-center px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo />
                        </Link>
                    </div>
                    <div className="flex-1 px-4 py-2">
                        <nav className="grid items-start gap-1 text-sm font-medium">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-slate-500 hover:text-indigo-600 hover:bg-indigo-50",
                                        pathname === item.href && "bg-indigo-50 text-indigo-600 font-semibold"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-indigo-600" : "text-slate-400")} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-6 border-t">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar>
                                <AvatarImage src="/admin-avatar.png" />
                                <AvatarFallback className="bg-orange-100 text-orange-600">AM</AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm truncate">Alex Morgan</p>
                                <p className="text-xs text-slate-500 truncate">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col bg-[#f8fafc]">
                <header className="flex h-20 items-center gap-4 px-6 border-b bg-white">
                    <h1 className="text-2xl font-bold text-slate-900 mr-auto">Overview</h1>

                    <div className="hidden md:flex relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search users, courses..."
                            className="w-full bg-slate-50 pl-10 border-slate-200 focus-visible:ring-indigo-500 rounded-lg"
                        />
                    </div>

                    <Button variant="ghost" size="icon" className="text-slate-500">
                        <Bell className="h-5 w-5" />
                    </Button>

                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md gap-2 shadow-sm">
                        <Plus className="h-4 w-4" /> Create New
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-6 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

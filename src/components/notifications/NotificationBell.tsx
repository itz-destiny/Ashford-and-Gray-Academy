"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useUserNotifications } from "@/firebase";
import { apiFetch } from "@/lib/api-client";

export function NotificationBell() {
    const { user } = useUser();
    const [open, setOpen] = useState(false);

    // Realtime subscription — replaces a 30s polling interval entirely.
    const { notifications, unreadCount } = useUserNotifications(user?.uid, { limit: 5 });

    const markAsRead = async (id: string) => {
        if (!user?.uid) return;
        try {
            await apiFetch(`/api/notifications/${id}`, { method: 'PATCH' });
            // No refetch needed — Firestore listener will fire automatically.
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.uid) return;
        try {
            await apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' });
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'enrollment': return '🎓';
            case 'message': return '💬';
            case 'payment': return '💳';
            case 'course_update': return '📚';
            case 'system': return '⚙️';
            case 'grade': return '📊';
            default: return '🔔';
        }
    };

    const formatTimeAgo = (date: Date | null) => {
        if (!date) return '';
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Bell className="h-12 w-12 mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`px-4 py-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                onClick={() => {
                                    if (!notification.isRead) markAsRead(notification.id);
                                    if (notification.link) {
                                        window.location.href = notification.link;
                                    }
                                    setOpen(false);
                                }}
                            >
                                <div className="flex gap-3 w-full">
                                    <div className="text-2xl flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-sm truncate">
                                                {notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                        {notification.message && (
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-1">
                                            {formatTimeAgo(notification.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/notifications" className="w-full text-center py-2 text-sm font-medium text-blue-600">
                        View all notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

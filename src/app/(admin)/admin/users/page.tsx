
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreVertical, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface User {
    _id: string;
    uid: string;
    displayName: string;
    email: string;
    role: string;
    photoURL?: string;
    school?: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("All");
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load users",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uid: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`/api/users?uid=${uid}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "User Deleted", description: "The user has been removed from the system." });
                fetchUsers();
            } else {
                throw new Error("Failed to delete user");
            }
        } catch (err: any) {
            toast({ variant: "destructive", title: "Deletion Failed", description: err.message });
        }
    };

    const handleRoleUpdate = async (uid: string, email: string, newRole: string) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, email, role: newRole })
            });
            if (res.ok) {
                toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
                fetchUsers();
            } else {
                throw new Error("Failed to update role");
            }
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    };

    const handleExport = () => {
        if (users.length === 0) return;
        const headers = ["Name", "Email", "Role", "School", "Joined"];
        const rows = users.map(u => [
            u.displayName,
            u.email,
            u.role,
            u.school || "N/A",
            new Date(u.createdAt).toLocaleDateString()
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'users_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "All" || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const roles = ["All", "admin", "instructor", "student"];

    const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || '??';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-slate-500">Manage students, instructors, and admins.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <CardTitle>All Users</CardTitle>
                            <select
                                className="h-9 px-2 bg-slate-50 border-none rounded-md text-sm text-slate-600 focus:ring-1 focus:ring-indigo-500"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex Number-4 gap-4 items-center">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 bg-slate-50 border-none"
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={handleExport} className="text-indigo-600 font-bold border-indigo-100 hover:bg-indigo-50">
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>School / Org</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.displayName}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    user.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                        user.role === 'instructor' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                            "bg-slate-50 text-slate-700 border-slate-200"
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.school || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-indigo-600 font-bold"
                                                    onClick={() => handleRoleUpdate(user.uid, user.email, user.role === 'admin' ? 'student' : user.role === 'instructor' ? 'admin' : 'instructor')}
                                                >
                                                    Cycle Role
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(user.uid)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

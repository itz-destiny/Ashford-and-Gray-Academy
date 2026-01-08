
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

    const filteredUsers = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <CardTitle>All Users</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
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
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4 text-slate-500" />
                                            </Button>
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

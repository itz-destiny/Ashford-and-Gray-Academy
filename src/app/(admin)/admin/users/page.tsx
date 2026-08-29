"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Trash, Plus } from "lucide-react";
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

    // Create User State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({
        displayName: "",
        email: "",
        role: "student"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await apiFetch('/api/users');
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
            const res = await apiFetch(`/api/users?uid=${uid}`, { method: 'DELETE' });
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
            const res = await apiFetch('/api/users', {
                method: 'POST',
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

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.displayName) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all fields." });
            return;
        }

        setIsCreating(true);
        try {
            const res = await apiFetch('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({
                    email: newUser.email,
                    displayName: newUser.displayName,
                    role: newUser.role,
                })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to create account");
            }

            toast({ title: "Account Created", description: `${newUser.displayName} can now log in — credentials were emailed to ${newUser.email}.` });
            setIsCreateOpen(false);
            setNewUser({ displayName: "", email: "", role: "student" });
            fetchUsers();

        } catch (error: any) {
            console.error("Creation Error:", error);
            toast({ variant: "destructive", title: "Creation Failed", description: error.message });
        } finally {
            setIsCreating(false);
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

    const roles = ["All", "admin", "registrar", "course_registrar", "finance", "instructor", "student"];
    const createRoles = [
        { value: "admin", label: "Super Admin" },
        { value: "registrar", label: "Acting Registrar" },
        { value: "course_registrar", label: "Course Registrar" },
        { value: "finance", label: "Finance Manager" },
        { value: "instructor", label: "Instructor" },
        { value: "student", label: "Student" }
    ];

    const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || '??';

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto bg-[#FAF9F6]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">System Administration</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight">User <span className="text-[#C8A96A]">Management.</span></h1>
                    <p className="text-slate-500 font-medium font-serif">Manage students, instructors, and admins.</p>
                </div>

                {/* Create User Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-5 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                            <Plus className="w-4 h-4 mr-2" /> Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-none border-[#0B1F3A]/10">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl text-[#0B1F3A]">Create New Account</DialogTitle>
                            <DialogDescription>
                                Creates a real login account. They'll receive an email with their address and a temporary password.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={newUser.displayName}
                                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                                    className="rounded-none"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="rounded-none"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                                >
                                    <SelectTrigger className="rounded-none">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        {createRoles.map(role => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-none">Cancel</Button>
                            <Button onClick={handleCreateUser} disabled={isCreating} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white rounded-none font-black text-[10px] uppercase tracking-widest">
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Account
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A]">
                <div className="px-8 py-6 border-b border-[#0B1F3A]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex gap-4 items-center flex-wrap">
                        <h2 className="text-lg font-serif text-[#0B1F3A]">All Users</h2>
                        <select
                            className="h-11 px-3 bg-white border border-[#0B1F3A]/10 rounded-none text-sm text-[#0B1F3A] font-medium focus:outline-none focus:ring-1 focus:ring-[#C8A96A]"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            {roles.map(role => (
                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-1 focus-visible:ring-[#C8A96A]"
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExport} className="h-11 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A]">
                            Export CSV
                        </Button>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center p-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#0B1F3A]/5">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-8 py-5">User</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">School / Org</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</TableHead>
                                <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.uid} className="hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                    <TableCell className="pl-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.photoURL} />
                                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-[#0B1F3A]">{user.displayName}</div>
                                                <div className="text-xs text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-none font-black text-[9px] uppercase tracking-wider",
                                                user.role === 'admin' ? "bg-[#0B1F3A]/5 text-[#0B1F3A] border-[#0B1F3A]/10" :
                                                    user.role === 'registrar' ? "bg-[#C8A96A]/10 text-[#C8A96A] border-[#C8A96A]/20" :
                                                        user.role === 'course_registrar' ? "bg-sky-50 text-sky-700 border-sky-200" :
                                                            user.role === 'finance' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                                user.role === 'instructor' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                    "bg-slate-50 text-slate-700 border-slate-200"
                                            )}
                                        >
                                            {user.role?.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {user.school || '-'}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    if (user.role === 'admin') {
                                                        toast({ variant: "destructive", title: "Action Prohibited", description: "Super Admin accounts cannot be deleted." });
                                                        return;
                                                    }
                                                    handleDelete(user.uid);
                                                }}
                                                disabled={user.role === 'admin'}
                                                className={cn(
                                                    "rounded-none text-red-500 hover:text-red-700 hover:bg-red-50",
                                                    user.role === 'admin' && "opacity-50 cursor-not-allowed"
                                                )}
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
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    ShieldCheck,
    Trash2,
    Edit2,
    CheckCircle2,
    XCircle
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StaffMember {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: string;
    title?: string;
    createdAt: string;
}

export default function RegistrarUsersPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const { toast } = useToast();

    // Add Staff Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({
        email: '',
        displayName: '',
        role: 'instructor' as any,
        title: '',
        uid: '' // In real app, this would be generated or handled by Firebase Admin
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users?role=staff');
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            }
        } catch (error) {
            console.error("Failed to fetch staff", error);
            toast({ variant: "destructive", title: "Fetch Failed", description: "Could not load staff members." });
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!newStaff.email || !newStaff.displayName) return;

        try {
            // Generative UID for mock/demo purposes if Firebase isn't handling it immediately
            const mockUid = newStaff.uid || `staff-${Math.random().toString(36).substr(2, 9)}`;

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newStaff,
                    uid: mockUid
                })
            });

            if (res.ok) {
                toast({ title: "Staff Added", description: `${newStaff.displayName} has been added as ${newStaff.role}.` });
                setIsAddModalOpen(false);
                setNewStaff({ email: '', displayName: '', role: 'instructor', title: '', uid: '' });
                fetchStaff();
            } else {
                throw new Error("Failed to create user");
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to add staff member." });
        }
    };

    const handleDeleteStaff = async (uid: string) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;

        try {
            const res = await fetch(`/api/users?uid=${uid}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Staff Removed" });
                fetchStaff();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to remove staff." });
        }
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || s.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">Admin</Badge>;
            case 'registrar': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">Registrar</Badge>;
            case 'course_registrar': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Course Registrar</Badge>;
            case 'finance': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Finance</Badge>;
            case 'instructor': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Instructor</Badge>;
            default: return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Staff & Admins
                        <Badge variant="outline" className="rounded-full px-3">{staff.length} Total</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage institutional access and organizational roles.</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                            <UserPlus className="w-4 h-4 mr-2" /> Add Staff Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Add New Staff</DialogTitle>
                            <DialogDescription>
                                Create a new staff account. They will be able to log in with their email.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Jane Doe"
                                    value={newStaff.displayName}
                                    onChange={(e) => setNewStaff({ ...newStaff, displayName: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="jane@ashfordgray.com"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>System Role</Label>
                                    <Select value={newStaff.role} onValueChange={(v) => setNewStaff({ ...newStaff, role: v })}>
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="instructor">Instructor</SelectItem>
                                            <SelectItem value="course_registrar">Course Registrar</SelectItem>
                                            <SelectItem value="finance">Finance Officer</SelectItem>
                                            <SelectItem value="registrar">Registrar</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Head of Dept"
                                        value={newStaff.title}
                                        onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleAddStaff} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 h-11">Create Account</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-2xl focus-visible:ring-indigo-500 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 h-11 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="border-none shadow-none focus:ring-0 w-[140px] h-full p-0">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admins</SelectItem>
                                        <SelectItem value="registrar">Registrars</SelectItem>
                                        <SelectItem value="course_registrar">Course Registrars</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="instructor">Instructors</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" onClick={fetchStaff} className="h-11 rounded-2xl border-slate-200 shadow-sm hover:bg-slate-50">
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="w-[300px] pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Member</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Position / Title</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</TableHead>
                                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={4} className="h-20 bg-slate-50/30 mb-2" />
                                    </TableRow>
                                ))
                            ) : filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <Users className="w-12 h-12 opacity-20" />
                                            <p className="font-bold">No staff members found</p>
                                            <p className="text-sm">Try adjusting your filters or search query.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((member) => (
                                    <TableRow key={member.uid} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    <AvatarImage src={member.photoURL} alt={member.displayName} />
                                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                        {member.displayName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 leading-tight">{member.displayName}</span>
                                                    <span className="text-xs text-slate-400 font-medium">{member.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 font-medium text-slate-600">
                                            {member.title || "Institutional Staff"}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getRoleBadge(member.role)}
                                        </TableCell>
                                        <TableCell className="py-4 text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-sm">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
                                                    <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Management Action</DropdownMenuLabel>
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm">Send Message</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                                        <Edit2 className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm">Edit Credentials</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-50 my-2" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteStaff(member.uid)}
                                                        className="rounded-xl flex items-center gap-3 p-3 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="font-bold text-sm">Revoke Access</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl bg-indigo-600 text-white p-6 relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <ShieldCheck className="w-10 h-10 mb-4 opacity-50" />
                    <h3 className="text-xl font-black mb-1 leading-tight">Secure Access</h3>
                    <p className="text-indigo-100/70 text-sm font-medium">All staff actions are logged and encrypted in the audit system.</p>
                </Card>
                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl bg-white p-6 border border-slate-50">
                    <CheckCircle2 className="w-10 h-10 mb-4 text-emerald-500 opacity-50" />
                    <h3 className="text-xl font-black mb-1 leading-tight text-slate-900">Compliance</h3>
                    <p className="text-slate-500 text-sm font-medium">Staff roles verify institutional identity and platform permissions.</p>
                </Card>
                <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl bg-slate-900 text-white p-6">
                    <XCircle className="w-10 h-10 mb-4 text-rose-500 opacity-50" />
                    <h3 className="text-xl font-black mb-1 leading-tight">Revocation</h3>
                    <p className="text-slate-400 text-sm font-medium">Instantly disable access for departing staff or compromised accounts.</p>
                </Card>
            </div>
        </div>
    );
}

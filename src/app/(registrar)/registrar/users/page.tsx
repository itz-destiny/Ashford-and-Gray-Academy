"use client";

import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { logAudit, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    XCircle,
    Loader2,
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

const ASSIGNABLE_ROLES = ['instructor', 'course_registrar', 'finance', 'registrar'] as const;

export default function RegistrarUsersPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const { toast } = useToast();
    const router = useRouter();

    // Add Staff Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newStaff, setNewStaff] = useState({
        email: '',
        displayName: '',
        role: 'instructor' as (typeof ASSIGNABLE_ROLES)[number],
        title: '',
    });

    // Edit Credentials Modal State
    const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
    const [editForm, setEditForm] = useState({ displayName: '', email: '', role: 'instructor' as (typeof ASSIGNABLE_ROLES)[number], title: '' });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/users?role=staff');
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

        setSaving(true);
        try {
            const res = await apiFetch('/api/registrar/staff', {
                method: 'POST',
                body: JSON.stringify(newStaff),
            });

            if (res.ok) {
                toast({ title: "Staff Account Created", description: `${newStaff.displayName} can now log in — credentials were emailed to ${newStaff.email}.` });
                await logAudit({
                    action: AUDIT_ACTIONS.USER_CREATED,
                    resource: AUDIT_RESOURCES.USER,
                    metadata: { email: newStaff.email, role: newStaff.role },
                });
                setIsAddModalOpen(false);
                setNewStaff({ email: '', displayName: '', role: 'instructor', title: '' });
                fetchStaff();
            } else {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to create account");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add staff member." });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStaff = async (uid: string, displayName: string) => {
        if (!confirm(`Revoke access for ${displayName}? This permanently deletes their account.`)) return;

        try {
            const res = await apiFetch(`/api/registrar/staff/${uid}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Staff Removed" });
                await logAudit({
                    action: AUDIT_ACTIONS.USER_DELETED,
                    resource: AUDIT_RESOURCES.USER,
                    resourceId: uid,
                });
                fetchStaff();
            } else {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to remove staff");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove staff." });
        }
    };

    const openEdit = (member: StaffMember) => {
        setEditTarget(member);
        setEditForm({
            displayName: member.displayName,
            email: member.email,
            role: (ASSIGNABLE_ROLES as readonly string[]).includes(member.role) ? (member.role as any) : 'instructor',
            title: member.title || '',
        });
    };

    const handleSaveEdit = async () => {
        if (!editTarget) return;
        setSaving(true);
        try {
            const res = await apiFetch(`/api/registrar/staff/${editTarget.uid}`, {
                method: 'PATCH',
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                toast({ title: "Credentials Updated", description: `${editForm.displayName}'s profile has been updated.` });
                await logAudit({
                    action: AUDIT_ACTIONS.USER_UPDATED,
                    resource: AUDIT_RESOURCES.USER,
                    resourceId: editTarget.uid,
                });
                setEditTarget(null);
                fetchStaff();
            } else {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to update staff member");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update staff member." });
        } finally {
            setSaving(false);
        }
    };

    const filteredStaff = staff.filter(s => {
        if (s.role === 'admin') return false;
        const matchesSearch = s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || s.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        const base = "rounded-none font-black text-[9px] uppercase tracking-widest border-none";
        switch (role) {
            case 'admin': return <Badge className={cn(base, "bg-rose-100 text-rose-700 hover:bg-rose-100")}>Admin</Badge>;
            case 'registrar': return <Badge className={cn(base, "bg-[#0B1F3A]/10 text-[#0B1F3A] hover:bg-[#0B1F3A]/10")}>Registrar</Badge>;
            case 'course_registrar': return <Badge className={cn(base, "bg-slate-200 text-slate-700 hover:bg-slate-200")}>Course Registrar</Badge>;
            case 'finance': return <Badge className={cn(base, "bg-[#1F7A5A]/10 text-[#1F7A5A] hover:bg-[#1F7A5A]/10")}>Finance</Badge>;
            case 'instructor': return <Badge className={cn(base, "bg-[#C8A96A]/10 text-[#0B1F3A] hover:bg-[#C8A96A]/10")}>Instructor</Badge>;
            default: return <Badge variant="outline" className="rounded-none">{role}</Badge>;
        }
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Enrolment Office</span>
                    </div>
                    <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                        Institutional <span className="text-[#C8A96A]">Staff.</span>
                        <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/20 rounded-none text-[9px] font-black uppercase tracking-widest">{filteredStaff.length} Total</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium font-serif">Manage institutional access and organizational roles.</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-6 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none">
                            <UserPlus className="w-4 h-4 mr-2" /> Add Staff Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-none border-[#0B1F3A]/10">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif text-[#0B1F3A]">Add New Staff</DialogTitle>
                            <DialogDescription>
                                Creates a real login account. They'll receive an email with their address and a temporary password.
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
                                    className="h-11 rounded-none border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="jane@ashfordandgrayfusionacademy.com"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="h-11 rounded-none border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>System Role</Label>
                                    <Select value={newStaff.role} onValueChange={(v) => setNewStaff({ ...newStaff, role: v as any })}>
                                        <SelectTrigger className="h-11 rounded-none border-[#0B1F3A]/10 focus:ring-[#C8A96A]">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-[#0B1F3A]/10">
                                            <SelectItem value="instructor">Instructor</SelectItem>
                                            <SelectItem value="course_registrar">Course Registrar</SelectItem>
                                            <SelectItem value="finance">Finance Officer</SelectItem>
                                            <SelectItem value="registrar">Registrar</SelectItem>
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
                                        className="h-11 rounded-none border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A]"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-none font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                            <Button onClick={handleAddStaff} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black rounded-none px-8 h-11 text-[10px] uppercase tracking-widest shadow-none">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-[#0B1F3A]/5 bg-[#F6F4F2]/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10 h-11 bg-white border-[#0B1F3A]/10 rounded-none focus-visible:ring-[#C8A96A]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 h-11 bg-white border border-[#0B1F3A]/10 rounded-none">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="border-none shadow-none focus:ring-0 w-[140px] h-full p-0">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-[#0B1F3A]/10">
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="registrar">Registrars</SelectItem>
                                        <SelectItem value="course_registrar">Course Registrars</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="instructor">Instructors</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" onClick={fetchStaff} className="h-11 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] hover:bg-[#F6F4F2]">
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#0B1F3A]/5">
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
                                        <TableCell colSpan={4} className="h-20 bg-[#F6F4F2]/60 mb-2" />
                                    </TableRow>
                                ))
                            ) : filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <Users className="w-12 h-12 opacity-20" />
                                            <p className="font-serif italic">No staff members found</p>
                                            <p className="text-sm">Try adjusting your filters or search query.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((member) => (
                                    <TableRow key={member.uid} className="group hover:bg-[#F6F4F2] border-[#0B1F3A]/5 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-11 w-11 border border-[#0B1F3A]/10">
                                                    <AvatarImage src={member.photoURL} alt={member.displayName} />
                                                    <AvatarFallback className="bg-[#F6F4F2] text-[#0B1F3A] font-black rounded-none">
                                                        {member.displayName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#0B1F3A] leading-tight">{member.displayName}</span>
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
                                                    <Button variant="ghost" size="icon" className="rounded-none hover:bg-[#F6F4F2]">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-none p-2 border-[#0B1F3A]/10 shadow-xl">
                                                    <DropdownMenuLabel className="px-3 pb-2 text-[10px] uppercase font-black text-slate-400">Management Action</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => router.push('/registrar/communications')}
                                                        className="rounded-none flex items-center gap-3 p-3 cursor-pointer"
                                                    >
                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm">Send Message</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openEdit(member)}
                                                        className="rounded-none flex items-center gap-3 p-3 cursor-pointer"
                                                    >
                                                        <Edit2 className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold text-sm">Edit Credentials</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[#0B1F3A]/5 my-2" />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (member.role === 'admin') {
                                                                toast({ variant: "destructive", title: "Action Prohibited", description: "Super Admin accounts cannot be removed by institutional staff." });
                                                                return;
                                                            }
                                                            handleDeleteStaff(member.uid, member.displayName);
                                                        }}
                                                        disabled={member.role === 'admin'}
                                                        className={cn(
                                                            "rounded-none flex items-center gap-3 p-3 cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-50",
                                                            member.role === 'admin' && "opacity-50 cursor-not-allowed"
                                                        )}
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
                <div className="bg-[#0B1F3A] border-t-4 border-t-[#C8A96A] p-8 relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <ShieldCheck className="w-10 h-10 mb-4 text-[#C8A96A] opacity-70" />
                    <h3 className="text-xl font-serif text-white mb-1 leading-tight">Secure Access</h3>
                    <p className="text-white/60 text-sm font-medium">All staff actions are logged and encrypted in the audit system.</p>
                </div>
                <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#1F7A5A] p-8">
                    <CheckCircle2 className="w-10 h-10 mb-4 text-[#1F7A5A] opacity-70" />
                    <h3 className="text-xl font-serif text-[#0B1F3A] mb-1 leading-tight">Compliance</h3>
                    <p className="text-slate-500 text-sm font-medium">Staff roles verify institutional identity and platform permissions.</p>
                </div>
                <div className="bg-[#0B1F3A] border-t-4 border-t-rose-400 p-8">
                    <XCircle className="w-10 h-10 mb-4 text-rose-400 opacity-70" />
                    <h3 className="text-xl font-serif text-white mb-1 leading-tight">Revocation</h3>
                    <p className="text-white/60 text-sm font-medium">Instantly disable access for departing staff or compromised accounts.</p>
                </div>
            </div>

            {/* Edit Credentials Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-none border-[#0B1F3A]/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-[#0B1F3A]">Edit Credentials</DialogTitle>
                        <DialogDescription>Update this staff member's profile and role.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.displayName}
                                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                className="h-11 rounded-none border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email Address</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="h-11 rounded-none border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>System Role</Label>
                                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as any })}>
                                    <SelectTrigger className="h-11 rounded-none border-[#0B1F3A]/10 focus:ring-[#C8A96A]">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-[#0B1F3A]/10">
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                        <SelectItem value="course_registrar">Course Registrar</SelectItem>
                                        <SelectItem value="finance">Finance Officer</SelectItem>
                                        <SelectItem value="registrar">Registrar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Job Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="h-11 rounded-none border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A]"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditTarget(null)} className="rounded-none font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black rounded-none px-8 h-11 text-[10px] uppercase tracking-widest shadow-none">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

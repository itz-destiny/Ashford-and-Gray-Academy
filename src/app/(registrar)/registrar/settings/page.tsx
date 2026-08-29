"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    User,
    Mail,
    Check,
    Building,
    Loader2,
} from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

const NOTIFICATION_ITEMS = [
    { id: 'userManagement', label: 'User Management Alerts', description: 'Notifications for new user registrations and role changes' },
    { id: 'courseApprovals', label: 'Course Approvals', description: 'Alerts when new courses require approval' },
    { id: 'auditLogs', label: 'Audit Log Notifications', description: 'Critical system events and security alerts' },
    { id: 'systemAlerts', label: 'System Alerts', description: 'Platform maintenance and system health updates' }
] as const;

export default function RegistrarSettingsPage() {
    const { user } = useUser();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [notifications, setNotifications] = useState({
        userManagement: true,
        courseApprovals: true,
        auditLogs: false,
        systemAlerts: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!user) return;
        setDisplayName(user.displayName || '');

        const load = async () => {
            try {
                const [settingsRes, profileRes] = await Promise.all([
                    apiFetch('/api/registrar/settings'),
                    apiFetch(`/api/users?uid=${user.uid}`),
                ]);
                if (settingsRes.ok) {
                    const settings = await settingsRes.json();
                    setInstitutionName(settings.institutionName || '');
                    setAcademicYear(settings.academicYear || '');
                }
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    if (profile.notificationPreferences) {
                        setNotifications(prev => ({ ...prev, ...profile.notificationPreferences }));
                    }
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await Promise.all([
                apiFetch('/api/registrar/settings', {
                    method: 'PATCH',
                    body: JSON.stringify({ institutionName, academicYear }),
                }),
                apiFetch('/api/users', {
                    method: 'POST',
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        displayName,
                        notificationPreferences: notifications,
                    }),
                }),
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save settings. Try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1000px] mx-auto">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Enrolment Office</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-3">
                    Platform <span className="text-[#C8A96A]">Settings.</span>
                    <Badge className="bg-[#C8A96A]/10 text-[#0B1F3A] border border-[#C8A96A]/20 rounded-none text-[9px] font-black uppercase tracking-widest">Registrar Role</Badge>
                </h1>
                <p className="text-slate-500 font-medium font-serif">Configure platform-wide settings and administrative preferences.</p>
            </div>

            {/* Profile Information */}
            <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none shadow-sm">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif text-[#0B1F3A]">
                        <User className="w-5 h-5 text-[#C8A96A]" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Your administrative account details</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="h-12 rounded-none bg-[#F6F4F2] border-none focus-visible:ring-[#C8A96A]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={user?.email || ''}
                                    className="h-12 rounded-none bg-[#F6F4F2] border-none pl-10"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Institution Settings */}
            <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none shadow-sm">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif text-[#0B1F3A]">
                        <Building className="w-5 h-5 text-[#C8A96A]" />
                        Institution Configuration
                    </CardTitle>
                    <CardDescription>Platform-wide institutional settings</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="institutionName">Institution Name</Label>
                            <Input
                                id="institutionName"
                                value={institutionName}
                                onChange={(e) => setInstitutionName(e.target.value)}
                                disabled={loading}
                                className="h-12 rounded-none bg-[#F6F4F2] border-none focus-visible:ring-[#C8A96A]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Academic Year</Label>
                            <Input
                                id="academicYear"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                disabled={loading}
                                className="h-12 rounded-none bg-[#F6F4F2] border-none focus-visible:ring-[#C8A96A]"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] rounded-none shadow-sm">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif text-[#0B1F3A]">
                        <Bell className="w-5 h-5 text-[#C8A96A]" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Manage your administrative alert settings</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                    {NOTIFICATION_ITEMS.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-[#F6F4F2] hover:bg-[#F0EDE7] transition-colors border border-[#0B1F3A]/5">
                            <div className="flex-1">
                                <p className="font-bold text-[#0B1F3A]">{item.label}</p>
                                <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                            <Switch
                                checked={notifications[item.id]}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white h-12 px-8 rounded-none font-black text-[10px] uppercase tracking-widest shadow-none"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </div>
    );
}

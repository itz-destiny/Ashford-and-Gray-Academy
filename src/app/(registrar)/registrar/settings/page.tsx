"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    Bell,
    Shield,
    User,
    Mail,
    Lock,
    Check,
    Building
} from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";

export default function RegistrarSettingsPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState({
        userManagement: true,
        courseApprovals: true,
        auditLogs: false,
        systemAlerts: true
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Save settings logic here
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    Platform Settings
                    <Badge variant="outline" className="rounded-full px-4">Registrar Role</Badge>
                </h2>
                <p className="text-slate-500 font-medium mt-2">Configure platform-wide settings and administrative preferences</p>
            </div>

            {/* Profile Information */}
            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem]">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="w-5 h-5 text-indigo-500" />
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
                                defaultValue={user?.displayName || ''}
                                className="h-12 rounded-xl bg-slate-50 border-none"
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
                                    className="h-12 rounded-xl bg-slate-50 border-none pl-10"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Institution Settings */}
            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem]">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Building className="w-5 h-5 text-indigo-500" />
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
                                defaultValue="Ashford & Gray Academy"
                                className="h-12 rounded-xl bg-slate-50 border-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Academic Year</Label>
                            <Input
                                id="academicYear"
                                defaultValue="2026"
                                className="h-12 rounded-xl bg-slate-50 border-none"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem]">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Manage your administrative alert settings</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    {[
                        { id: 'userManagement', label: 'User Management Alerts', description: 'Notifications for new user registrations and role changes' },
                        { id: 'courseApprovals', label: 'Course Approvals', description: 'Alerts when new courses require approval' },
                        { id: 'auditLogs', label: 'Audit Log Notifications', description: 'Critical system events and security alerts' },
                        { id: 'systemAlerts', label: 'System Alerts', description: 'Platform maintenance and system health updates' }
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex-1">
                                <p className="font-bold text-slate-900">{item.label}</p>
                                <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                            <Switch
                                checked={notifications[item.id as keyof typeof notifications]}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem]">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        Security & Privacy
                    </CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-bold">
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-bold">
                        <Settings className="w-4 h-4 mr-2" />
                        Two-Factor Authentication
                    </Button>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" className="h-12 px-8 rounded-xl font-bold">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-indigo-100"
                >
                    {saved ? (
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

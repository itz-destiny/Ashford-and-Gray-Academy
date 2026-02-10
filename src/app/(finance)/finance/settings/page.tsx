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
    Check
} from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";

export default function FinanceSettingsPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState({
        transactions: true,
        payouts: true,
        scholarships: false,
        reports: true
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
                    Finance Settings
                    <Badge variant="outline" className="rounded-full px-4">Finance Role</Badge>
                </h2>
                <p className="text-slate-500 font-medium mt-2">Configure your finance dashboard preferences and notifications</p>
            </div>

            {/* Profile Information */}
            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem]">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="w-5 h-5 text-indigo-500" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Your account details and contact information</CardDescription>
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

            {/* Notification Preferences */}
            <Card className="border-none shadow-xl shadow-slate-100 rounded-[2.5rem]">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Manage your finance alert settings</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    {[
                        { id: 'transactions', label: 'Transaction Alerts', description: 'Get notified of new tuition payments and refunds' },
                        { id: 'payouts', label: 'Payout Notifications', description: 'Receive alerts for instructor payment processing' },
                        { id: 'scholarships', label: 'Scholarship Updates', description: 'Updates on financial aid applications and approvals' },
                        { id: 'reports', label: 'Financial Reports', description: 'Weekly and monthly revenue summary emails' }
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

            {/* Security  */}
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

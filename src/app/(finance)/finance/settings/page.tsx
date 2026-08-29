"use client";

import React, { useState } from 'react';
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
        <div className="px-6 md:px-12 py-12 space-y-16 pb-32 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F3A]/60">Financial Office</span>
                </div>
                <h1 className="text-4xl font-serif text-[#0B1F3A] tracking-tight flex items-center gap-4">
                    Finance Settings
                    <Badge className="bg-[#F6F4F2] text-[#0B1F3A] border border-[#0B1F3A]/10 rounded-none font-black text-[9px] uppercase tracking-widest">Finance Role</Badge>
                </h1>
                <p className="text-slate-500 font-medium font-serif">Configure your finance dashboard preferences and notifications.</p>
            </div>

            {/* Profile Information */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8">
                <h2 className="text-2xl font-serif text-[#0B1F3A] flex items-center gap-3 mb-1">
                    <User className="w-5 h-5 text-[#C8A96A]" />
                    Profile Information
                </h2>
                <p className="text-slate-500 font-medium mb-6">Your account details and contact information.</p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Name</Label>
                        <Input
                            id="displayName"
                            defaultValue={user?.displayName || ''}
                            className="h-12 rounded-none bg-white border border-[#0B1F3A]/10 focus-visible:ring-[#C8A96A]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                id="email"
                                type="email"
                                defaultValue={user?.email || ''}
                                className="h-12 rounded-none bg-white border border-[#0B1F3A]/10 pl-10"
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8">
                <h2 className="text-2xl font-serif text-[#0B1F3A] flex items-center gap-3 mb-1">
                    <Bell className="w-5 h-5 text-[#C8A96A]" />
                    Notification Preferences
                </h2>
                <p className="text-slate-500 font-medium mb-6">Manage your finance alert settings.</p>
                <div className="space-y-3">
                    {[
                        { id: 'transactions', label: 'Transaction Alerts', description: 'Get notified of new tuition payments and refunds' },
                        { id: 'payouts', label: 'Payout Notifications', description: 'Receive alerts for instructor payment processing' },
                        { id: 'scholarships', label: 'Scholarship Updates', description: 'Updates on financial aid applications and approvals' },
                        { id: 'reports', label: 'Financial Reports', description: 'Weekly and monthly revenue summary emails' }
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-[#F6F4F2] border border-[#0B1F3A]/5">
                            <div className="flex-1">
                                <p className="font-black text-[#0B1F3A]">{item.label}</p>
                                <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                            <Switch
                                checked={notifications[item.id as keyof typeof notifications]}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-[#0B1F3A]/10 border-t-4 border-t-[#C8A96A] p-8">
                <h2 className="text-2xl font-serif text-[#0B1F3A] flex items-center gap-3 mb-1">
                    <Shield className="w-5 h-5 text-[#C8A96A]" />
                    Security &amp; Privacy
                </h2>
                <p className="text-slate-500 font-medium mb-6">Manage your account security settings.</p>
                <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A]">
                        <Lock className="w-4 h-4 mr-2 text-[#C8A96A]" />
                        Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A]">
                        <Settings className="w-4 h-4 mr-2 text-[#C8A96A]" />
                        Two-Factor Authentication
                    </Button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" className="h-12 px-8 rounded-none border-[#0B1F3A]/10 font-black text-[10px] uppercase tracking-widest text-[#0B1F3A] shadow-none">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    className="h-12 px-8 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest shadow-none border-none"
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

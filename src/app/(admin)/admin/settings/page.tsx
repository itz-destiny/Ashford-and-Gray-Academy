"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, Bell, Globe, Save, RefreshCw, Trash2, Key, Activity } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-600" />
                        System Configuration
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Access highly sensitive institutional parameters and global system settings.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="font-bold border-slate-200 h-11 px-6 rounded-xl gap-2 shadow-sm bg-white">
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                        Reset Defaults
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 gap-2">
                        <Save className="w-4 h-4" />
                        Apply Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white border border-white/20">
                        <CardHeader className="p-10 border-b border-slate-50">
                            <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                <Shield className="w-6 h-6 text-indigo-500" />
                                Security Protocol & Access
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage institutional security thresholds</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100/50">
                                <div className="space-y-1">
                                    <Label className="text-base font-black text-slate-800">Two-Factor Authentication (2FA)</Label>
                                    <p className="text-xs font-bold text-slate-400 max-w-sm">Enforce secondary authentication for all faculty and administrative staff.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100/50">
                                <div className="space-y-1">
                                    <Label className="text-base font-black text-slate-800">Public User Registrations</Label>
                                    <p className="text-xs font-bold text-slate-400 max-w-sm">Allow prospective students to create accounts without institutional verification.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Institutional Domain Whitelist</Label>
                                <div className="flex gap-4">
                                    <Input placeholder="ashfordgray.ac.uk, partners.edu" className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-indigo-500/20 font-bold" />
                                    <Button className="bg-slate-900 text-white h-12 px-6 rounded-xl font-bold">Add Domain</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white border border-white/20">
                        <CardHeader className="p-10 border-b border-slate-50">
                            <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                <Globe className="w-6 h-6 text-emerald-500" />
                                Global Platform Logic
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Configure cross-system behavior and defaults</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">System Language</Label>
                                    <Input defaultValue="Academic English (UK)" className="h-12 bg-slate-50/50 border-none rounded-xl font-bold text-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Institutional Timezone</Label>
                                    <Input defaultValue="(GMT+00:00) London" className="h-12 bg-slate-50/50 border-none rounded-xl font-bold text-slate-700" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100/50">
                                <div className="space-y-1">
                                    <Label className="text-base font-black text-slate-800">Automated Grade Archiving</Label>
                                    <p className="text-xs font-bold text-slate-400">Sync all grades to the redundant off-site vault every 24 hours.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-indigo-600 text-white relative group h-fit">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-900" />
                        <CardHeader className="relative z-10 p-10">
                            <CardTitle className="text-2xl font-black uppercase tracking-tighter">System Health</CardTitle>
                            <CardDescription className="text-indigo-100/70 font-bold uppercase text-[10px] tracking-widest">Real-time status</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 p-10 pt-0 space-y-6">
                            <div className="p-6 bg-white/10 backdrop-blur rounded-[2rem] border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">CPU CLUSTER</span>
                                    <span className="font-bold">12% Load</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[12%] rounded-full shadow-[0_0_10px_white]" />
                                </div>
                            </div>

                            <div className="p-6 bg-white/10 backdrop-blur rounded-[2rem] border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">MEMORY BANK</span>
                                    <span className="font-bold">4.2GB / 16GB</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 w-[26%] rounded-full shadow-[0_0_10px_#34d399]" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="relative z-10 p-10 pt-0">
                            <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-black h-12 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all hover:-translate-y-1">
                                <Activity className="w-4 h-4 mr-2" />
                                Launch Systems Monitor
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white border border-rose-100">
                        <CardHeader className="p-8">
                            <CardTitle className="text-lg font-black text-rose-600 uppercase tracking-tighter">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            <Button variant="outline" className="w-full border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold h-11 rounded-xl transition-all">
                                Purge Academic Cache
                            </Button>
                            <Button variant="outline" className="w-full border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold h-11 rounded-xl transition-all">
                                Revoke Active Sessions
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

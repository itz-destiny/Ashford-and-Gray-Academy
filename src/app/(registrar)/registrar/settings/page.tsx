"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function RegistrarSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings and policies</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-slate-400">
                        <div className="text-center">
                            <SettingsIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p>Settings interface coming soon</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

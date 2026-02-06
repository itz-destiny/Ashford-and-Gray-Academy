"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

export default function RegistrarUsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Staff & Admins</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage platform staff and administrators</p>
                </div>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff Member
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-slate-400">
                        Staff management interface coming soon
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

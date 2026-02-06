"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function FinancePayoutsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Payouts</h2>
                <p className="text-sm text-slate-500 mt-1">Manage instructor and affiliate payouts</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payout Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-slate-400">
                        <div className="text-center">
                            <CreditCard className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p>Payout management coming soon</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function FinanceTransactionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">All Transactions</h2>
                <p className="text-sm text-slate-500 mt-1">View and manage all financial transactions</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-slate-400">
                        <div className="text-center">
                            <DollarSign className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p>Transaction ledger coming soon</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

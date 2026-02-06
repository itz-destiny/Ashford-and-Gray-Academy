"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export default function FinanceReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Financial Reports</h2>
                <p className="text-sm text-slate-500 mt-1">Generate and view financial reports</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-slate-400">
                        <div className="text-center">
                            <PieChart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p>Financial reports coming soon</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

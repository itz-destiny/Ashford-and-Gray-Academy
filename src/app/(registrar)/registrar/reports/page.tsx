"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function RegistrarReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
                <p className="text-sm text-slate-500 mt-1">Generate and view platform reports</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Platform Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40 text-slate-400">
                        <div className="text-center">
                            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p>Reports interface coming soon</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

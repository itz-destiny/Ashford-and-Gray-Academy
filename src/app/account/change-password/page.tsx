"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { initializeFirebase, useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChangePasswordPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ current: "", next: "", confirm: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;

        if (form.next.length < 8) {
            toast({ variant: "destructive", title: "Password too short", description: "Use at least 8 characters." });
            return;
        }
        if (form.next !== form.confirm) {
            toast({ variant: "destructive", title: "Passwords don't match", description: "Re-enter your new password to confirm." });
            return;
        }

        setSaving(true);
        try {
            const { auth } = initializeFirebase();
            const fbUser = auth.currentUser;
            if (!fbUser || !fbUser.email) throw new Error("Not signed in.");
            const credential = EmailAuthProvider.credential(fbUser.email, form.current);
            await reauthenticateWithCredential(fbUser, credential);
            await updatePassword(fbUser, form.next);

            await apiFetch("/api/users/password-changed", { method: "POST" });

            toast({ title: "Password set", description: "You're all set — welcome to your dashboard." });
            router.push("/dashboard");
        } catch (err: any) {
            const code = err?.code || "";
            const message =
                code === "auth/wrong-password" ? "That temporary password is incorrect."
                : code === "auth/weak-password" ? "Choose a stronger password."
                : err?.message || "Could not update your password.";
            toast({ variant: "destructive", title: "Update failed", description: message });
        } finally {
            setSaving(false);
        }
    };

    if (userLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A]"><Loader2 className="h-8 w-8 animate-spin text-[#C8A96A]" /></div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-6 py-16">
            <Card className="w-full max-w-md rounded-[32px] border-none shadow-xl">
                <CardHeader className="p-10 pb-4 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto bg-[#0B1F3A]/5 flex items-center justify-center rounded-2xl">
                        <ShieldCheck className="w-7 h-7 text-[#0B1F3A]" />
                    </div>
                    <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Set Your Password</CardTitle>
                    <CardDescription className="text-slate-500">
                        For your security, set your own password before continuing to your dashboard.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-10 pt-4 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="current" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporary Password</Label>
                            <Input id="current" type="password" required value={form.current} onChange={(e) => setForm(f => ({ ...f, current: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none px-5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="next" className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
                            <Input id="next" type="password" required value={form.next} onChange={(e) => setForm(f => ({ ...f, next: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none px-5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm New Password</Label>
                            <Input id="confirm" type="password" required value={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none px-5" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0">
                        <Button type="submit" disabled={saving} className="w-full h-14 rounded-xl bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Set Password &amp; Continue
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

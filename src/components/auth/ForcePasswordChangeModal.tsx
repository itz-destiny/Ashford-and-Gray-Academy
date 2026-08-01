"use client";

import { useState } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { initializeFirebase, useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Blocks all interaction with the portal until a system-issued password
 * (from /api/applications or a first successful payment) is replaced.
 * Mounted once at the root layout so it appears regardless of which portal
 * the account belongs to.
 */
export function ForcePasswordChangeModal() {
    const { user } = useUser();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [justChanged, setJustChanged] = useState(false);
    const [form, setForm] = useState({ current: "", next: "", confirm: "" });

    // useUser() only refetches the Mongo profile on auth state changes, not
    // when this flag flips server-side mid-session — so track success locally
    // rather than waiting on a refetch that will never come.
    const open = !!user?.mustChangePassword && !justChanged;

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

            toast({ title: "Password set", description: "Welcome — you're all set." });
            setForm({ current: "", next: "", confirm: "" });
            setJustChanged(true);
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

    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                className="sm:max-w-md rounded-[28px] p-0 overflow-hidden border-none"
            >
                <div className="bg-[#0B1F3A] px-8 pt-10 pb-8 text-center">
                    <div className="w-14 h-14 mx-auto bg-white/10 flex items-center justify-center rounded-2xl mb-4">
                        <ShieldCheck className="w-7 h-7 text-[#C8A96A]" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif text-white">Set Your Password</DialogTitle>
                        <DialogDescription className="text-white/60">
                            For your security, set your own password before continuing.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5 bg-white">
                    <div className="space-y-2">
                        <Label htmlFor="fpc-current" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporary Password</Label>
                        <Input id="fpc-current" type="password" required autoFocus value={form.current} onChange={(e) => setForm(f => ({ ...f, current: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none px-5" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fpc-next" className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
                        <Input id="fpc-next" type="password" required value={form.next} onChange={(e) => setForm(f => ({ ...f, next: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none px-5" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fpc-confirm" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm New Password</Label>
                        <Input id="fpc-confirm" type="password" required value={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none px-5" />
                    </div>
                    <Button type="submit" disabled={saving} className="w-full h-14 rounded-xl bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Set Password &amp; Continue
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

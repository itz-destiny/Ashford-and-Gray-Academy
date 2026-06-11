
"use client";

import { useState, useEffect } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { initializeFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/firebase";
import { Loader2, Shield, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });
  const [prefs, setPrefs] = useState({ announcements: true, "new-courses": true, reminders: true });

  useEffect(() => {
    if (user) {
      const stored = typeof window !== "undefined" ? localStorage.getItem(`prefs:${user.uid}`) : null;
      if (stored) {
        try { setPrefs((p) => ({ ...p, ...JSON.parse(stored) })); } catch { /* ignore */ }
      }
    }
  }, [user]);

  const handlePasswordChange = async () => {
    if (!user || !user.email) return;
    if (!passwordForm.current || !passwordForm.next) {
      toast({ variant: "destructive", title: "Missing fields", description: "Enter both your current and new password." });
      return;
    }
    if (passwordForm.next.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Use at least 8 characters." });
      return;
    }
    setSavingPassword(true);
    try {
      const { auth } = initializeFirebase();
      const fbUser = auth.currentUser;
      if (!fbUser || !fbUser.email) throw new Error("Not signed in.");
      const credential = EmailAuthProvider.credential(fbUser.email, passwordForm.current);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, passwordForm.next);
      toast({ title: "Password updated", description: "Your sign-in credentials have been changed." });
      setPasswordForm({ current: "", next: "" });
    } catch (err: any) {
      const code = err?.code || "";
      const message =
        code === "auth/wrong-password" ? "Current password is incorrect."
        : code === "auth/weak-password" ? "Choose a stronger password."
        : code === "auth/requires-recent-login" ? "Please sign out and back in, then try again."
        : err?.message || "Could not update your password.";
      toast({ variant: "destructive", title: "Update failed", description: message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePrefs = async () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      localStorage.setItem(`prefs:${user.uid}`, JSON.stringify(prefs));
      toast({ title: "Preferences saved", description: "Your notification settings are committed." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err?.message || "Could not save preferences." });
    } finally {
      setSavingPrefs(false);
    }
  };

  if (userLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-12 w-12 text-[#1F7A5A]" /></div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A]">Settings</h1>
        <p className="text-slate-400 font-medium">Manage your account security and notification preferences.</p>
      </div>

      {/* Security Section */}
      <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-[#0B1F3A]" />
            <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Security</CardTitle>
          </div>
          <CardDescription className="text-slate-400">Update your password to maintain account security.</CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="current-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</Label>
              <Input id="current-password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(f => ({ ...f, current: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
              <Input id="new-password" type="password" value={passwordForm.next} onChange={(e) => setPasswordForm(f => ({ ...f, next: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-10 bg-slate-50/50 flex justify-end">
          <Button onClick={handlePasswordChange} disabled={savingPassword} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black px-12 py-6 rounded-2xl shadow-xl transition-all h-auto text-[10px] uppercase tracking-widest gap-2">
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </CardFooter>
      </Card>

      {/* Alert Preferences */}
      <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-[#0B1F3A]" />
            <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Alerts & Notifications</CardTitle>
          </div>
          <CardDescription className="text-slate-400">Select which communications you wish to receive from the academy.</CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="space-y-6">
            {[
              { id: "announcements", label: "Platform Announcements", desc: "System-wide updates and institutional news." },
              { id: "new-courses", label: "Program Alerts", desc: "Notifications when new courses are published in your catalog." },
              { id: "reminders", label: "Academic Reminders", desc: "Critical alerts for upcoming events and assessment deadlines." }
            ].map((notif) => (
              <div key={notif.id} className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <Checkbox
                  id={notif.id}
                  checked={(prefs as any)[notif.id] ?? true}
                  onCheckedChange={(checked) => setPrefs(p => ({ ...p, [notif.id]: !!checked }))}
                  className="mt-1 border-slate-300 data-[state=checked]:bg-[#1F7A5A] data-[state=checked]:border-[#1F7A5A]"
                />
                <label htmlFor={notif.id} className="space-y-1 cursor-pointer">
                  <p className="text-sm font-black text-[#0B1F3A] uppercase tracking-widest">{notif.label}</p>
                  <p className="text-xs text-slate-400">{notif.desc}</p>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-10 bg-slate-50/50 flex justify-end">
          <Button onClick={handleSavePrefs} disabled={savingPrefs} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black px-12 py-6 rounded-2xl shadow-xl transition-all h-auto text-[10px] uppercase tracking-widest gap-2">
            {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

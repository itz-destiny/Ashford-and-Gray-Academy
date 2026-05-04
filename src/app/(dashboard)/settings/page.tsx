
"use client";

import { useState, useEffect } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/firebase";
import { Loader2, User, Shield, Bell, CreditCard, Save, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  // Removed hardcoded "4242" card to fix the user's issue
  const [cards, setCards] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    bio: "",
    school: "",
    title: "",
    organization: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        bio: (user as any).bio || "",
        school: (user as any).school || "",
        title: (user as any).title || "",
        organization: (user as any).organization || ""
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: formData.email,
          displayName: formData.displayName,
          bio: formData.bio,
          school: formData.school,
          title: formData.title,
          organization: formData.organization,
          role: (user as any).role
        })
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast({
        title: "Profile Synchronized",
        description: "Your institutional records have been updated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not synchronize with the central registry.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Payment Method Revoked",
      description: "The selected card has been removed from your profile.",
    });
  };

  const handleAddPayment = () => {
    setAddingPayment(true);
    setTimeout(() => {
      setAddingPayment(false);
      toast({
        title: "Secure Gateway Opening...",
        description: "Redirecting to our PCI-compliant payment partner.",
      });
    }, 1000);
  };

  if (userLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-12 w-12 text-[#1F7A5A]" /></div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A]">Institutional Settings</h1>
        <p className="text-slate-400 font-medium">Manage your professional identity and account preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-10">
        <TabsList className="bg-slate-50 p-1.5 rounded-[2rem] w-full max-w-3xl border border-slate-100 h-auto flex flex-wrap md:flex-nowrap">
          <TabsTrigger value="profile" className="flex-1 rounded-[1.5rem] py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#1F7A5A] font-black text-[10px] uppercase tracking-widest gap-2">
             <User size={14} /> Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1 rounded-[1.5rem] py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#1F7A5A] font-black text-[10px] uppercase tracking-widest gap-2">
             <Shield size={14} /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 rounded-[1.5rem] py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#1F7A5A] font-black text-[10px] uppercase tracking-widest gap-2">
             <Bell size={14} /> Alerts
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex-1 rounded-[1.5rem] py-4 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#1F7A5A] font-black text-[10px] uppercase tracking-widest gap-2">
             <CreditCard size={14} /> Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Academic Identity</CardTitle>
              <CardDescription className="text-slate-400">Update how you appear within the Ashford & Gray network.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                  <Input id="displayName" value={formData.displayName} onChange={handleInputChange} className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="h-14 rounded-2xl bg-slate-100 border-none px-6 cursor-not-allowed opacity-60" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Bio</Label>
                <Input id="bio" value={formData.bio} onChange={handleInputChange} placeholder="Brief description for institutional records" className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="school" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Home University</Label>
                  <Input id="school" value={formData.school} onChange={handleInputChange} placeholder="Ex: London School of Economics" className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="organization" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Organization</Label>
                  <Input id="organization" value={formData.organization} onChange={handleInputChange} placeholder="Ex: Ashford & Gray Academy" className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Role</Label>
                <select
                  id="role"
                  value={(user as any).role}
                  onChange={async (e) => {
                    if (!user) return;
                    const newRole = e.target.value;
                    setSaving(true);
                    try {
                      await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: user.uid, email: user.email, role: newRole })
                      });
                      toast({ title: "Authority Updated", description: "Your access levels are being reconfigured." });
                      window.location.reload();
                    } catch (err) {
                      toast({ variant: "destructive", title: "Transition Failed" });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none focus:ring-1 focus:ring-[#1F7A5A] outline-none font-medium appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-[10px] text-slate-400 italic">Changing your role will re-route your dashboard access upon next login.</p>
              </div>
            </CardContent>
            <CardFooter className="p-10 bg-slate-50/50 flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black px-12 py-6 rounded-2xl shadow-xl transition-all h-auto text-[10px] uppercase tracking-widest gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                Synchronize Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Access & Security</CardTitle>
              <CardDescription className="text-slate-400">Maintain the integrity of your institutional account.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="current-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Authorization</Label>
                  <Input id="current-password" type="password" className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Authorization</Label>
                  <Input id="new-password" type="password" className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1F7A5A]" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-10 bg-slate-50/50 flex justify-end">
              <Button className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black px-12 py-6 rounded-2xl shadow-xl transition-all h-auto text-[10px] uppercase tracking-widest">
                Update Credentials
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Alert Configuration</CardTitle>
              <CardDescription className="text-slate-400">Select which communications you wish to receive from the registry.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-6">
                {[
                  { id: "announcements", label: "Platform Announcements", desc: "System-wide updates and institutional news." },
                  { id: "new-courses", label: "Program Alerts", desc: "Notifications when new courses are published in your catalog." },
                  { id: "reminders", label: "Academic Reminders", desc: "Critical alerts for upcoming events and assessment deadlines." }
                ].map((notif) => (
                  <div key={notif.id} className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <Checkbox id={notif.id} className="mt-1 border-slate-300 data-[state=checked]:bg-[#1F7A5A] data-[state=checked]:border-[#1F7A5A]" />
                    <label htmlFor={notif.id} className="space-y-1 cursor-pointer">
                      <p className="text-sm font-black text-[#0B1F3A] uppercase tracking-widest">{notif.label}</p>
                      <p className="text-xs text-slate-400">{notif.desc}</p>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-10 bg-slate-50/50 flex justify-end">
              <Button className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black px-12 py-6 rounded-2xl shadow-xl transition-all h-auto text-[10px] uppercase tracking-widest">
                Commit Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-10 pb-0">
              <CardTitle className="text-2xl font-serif text-[#0B1F3A]">Financial Management</CardTitle>
              <CardDescription className="text-slate-400">Securely manage your institutional payment methods and history.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cards.length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-200 mb-4">
                           <CreditCard size={32} />
                        </div>
                        <h4 className="text-lg font-serif text-[#0B1F3A] mb-2">No Registered Methods</h4>
                        <p className="text-xs text-slate-400 max-w-[240px]">You haven't added any payment methods to your institutional account yet.</p>
                    </div>
                ) : (
                    cards.map(card => (
                      <div key={card.id} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex justify-between items-center group hover:border-[#1F7A5A]/30 transition-all">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                                 <CreditCard size={16} />
                              </div>
                              <p className="font-black text-[#0B1F3A] uppercase tracking-widest text-[10px]">{card.type} •••• {card.last4}</p>
                           </div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest pl-11">Expires {card.exp}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCard(card.id)} className="rounded-full text-slate-200 hover:text-red-500 hover:bg-red-50">
                           <Trash2 size={18} />
                        </Button>
                      </div>
                    ))
                )}
              </div>
              <Button variant="outline" onClick={handleAddPayment} disabled={addingPayment} className="w-full md:w-auto h-16 px-10 rounded-2xl border-2 border-[#0B1F3A] text-[#0B1F3A] font-black text-[10px] uppercase tracking-widest hover:bg-[#0B1F3A] hover:text-white transition-all gap-2">
                {addingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus size={16} />}
                Add Professional Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

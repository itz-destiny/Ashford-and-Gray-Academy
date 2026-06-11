
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
import { useUser } from "@/firebase";
import { apiFetch } from "@/lib/api-client";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

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
      const res = await apiFetch('/api/users', {
        method: 'POST',
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

  if (userLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-12 w-12 text-[#1F7A5A]" /></div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif text-[#0B1F3A]">My Profile</h1>
        <p className="text-slate-400 font-medium">Manage your professional identity within the Ashford & Gray network.</p>
      </div>

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
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Role</Label>
            <div className="h-14 rounded-2xl bg-slate-50 px-6 flex items-center font-medium text-[#0B1F3A] capitalize">
              {(user as any)?.role?.replace('_', ' ') || 'student'}
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Role changes are handled by an administrator. Contact your registrar to request a change.
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-10 bg-slate-50/50 flex justify-end">
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black px-12 py-6 rounded-2xl shadow-xl transition-all h-auto text-[10px] uppercase tracking-widest gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            Save Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

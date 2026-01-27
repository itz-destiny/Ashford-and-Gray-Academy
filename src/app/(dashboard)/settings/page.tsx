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
import { useUser } from "@/firebase/auth/use-user";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    bio: "",
    school: "",
    title: "", // For instructors/admins often used as "Job Title"
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
        method: 'POST', // Using POST as upsert/update based on our API design
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: formData.email,
          displayName: formData.displayName,
          bio: formData.bio,
          school: formData.school,
          title: formData.title,
          organization: formData.organization,
          role: (user as any).role // PERSIST THE ROLE
        })
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is how others will see you on the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input id="displayName" value={formData.displayName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} disabled className="bg-slate-100 cursor-not-allowed" />
              <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">School / University</Label>
                <Input id="school" value={formData.school} onChange={handleInputChange} placeholder="Ex: Harvard University" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" value={formData.organization} onChange={handleInputChange} placeholder="Ex: Ashford & Gray" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type (Role)</Label>
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
                    toast({ title: "Role Updated", description: `Account type changed to ${newRole}. Please reload to see changes.` });
                    window.location.reload();
                  } catch (err) {
                    toast({ variant: "destructive", title: "Update Failed" });
                  } finally {
                    setSaving(false);
                  }
                }}
                className="w-full p-2 rounded-md border border-input bg-background"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-[0.7rem] text-muted-foreground italic">Caution: Changing your role will change your dashboard access.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings and password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Password</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose what you want to be notified about.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="font-semibold">Email Notifications</div>
            <div className="flex items-center space-x-2">
              <Checkbox id="announcements" defaultChecked />
              <label htmlFor="announcements" className="text-sm font-medium leading-none">
                Platform Announcements
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="new-courses" defaultChecked />
              <label htmlFor="new-courses" className="text-sm font-medium leading-none">
                New Course Alerts
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="reminders" />
              <label htmlFor="reminders" className="text-sm font-medium leading-none">
                Event & Deadline Reminders
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>
              Manage your payment methods and view invoice history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card>
              <CardHeader className="flex-row justify-between items-center">
                <CardTitle className="text-base">Visa ending in 4242</CardTitle>
                <Button variant="outline" size="sm">Remove</Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
              </CardContent>
            </Card>
            <Button variant="secondary">Add New Payment Method</Button>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
      </TabsContent>

    </Tabs>
  );
}

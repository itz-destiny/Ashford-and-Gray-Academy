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

export default function SettingsPage() {
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Alex Johnson" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="alex.johnson@example.com" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" defaultValue="Lifelong learner and aspiring web developer." />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
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

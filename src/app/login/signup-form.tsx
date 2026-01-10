
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle, Loader2, User, GraduationCap } from "lucide-react";
import { AuthForm } from "./auth-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { signUpWithEmail } from "@/firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SignUpFormProps = {
  onSwitchToLogin?: () => void;
};

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl');
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email-signup") as HTMLInputElement).value;

    const studentData = {
      dateOfBirth: (form.elements.namedItem("dob") as HTMLInputElement)?.value,
      school: (form.elements.namedItem("school") as HTMLInputElement)?.value,
    };
    const instructorData = {
      expertise: (form.elements.namedItem("expertise") as HTMLInputElement)?.value,
      organization: (form.elements.namedItem("organization") as HTMLInputElement)?.value,
    };

    const userData = {
      name,
      email,
      role,
      ...(role === 'student' ? studentData : {}),
      ...(role === 'instructor' ? instructorData : {}),
    };

    const { error, user } = await signUpWithEmail(email, password, { name });

    if (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error,
      });
      return;
    }

    if (user) {
      // Manually sync to MongoDB
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: name,
            role,
            ...userData // spread student/instructor specific data
          })
        });

        setIsLoading(false);
        toast({
          title: (
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span>Account Created!</span>
            </div>
          ),
          description: "Redirecting you to your dashboard...",
        });

        if (onSwitchToLogin) {
          // If successful, the user is ALREADY logged in via Firebase.
          // We should just redirect them to the correct page.
          // Force a hard navigation or router push to ensure role is picked up.
          const target = role === 'instructor' ? '/instructor' : '/dashboard';

          // Using window.location to ensure a full refresh so useUser gets the fresh data
          window.location.href = target;
        }

      } catch (err) {
        console.error("Error syncing user to DB:", err);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Account Created but Profile Sync Failed",
          description: "Please contact support.",
        });
      }
    }
  };

  return (
    <AuthForm
      title="Create Your Account"
      description="Join our community to start learning and managing events."
      footerText="Already have an account?"
      footerLinkText="Log In"
      onFooterLinkClick={onSwitchToLogin}
    >
      <form className="space-y-4" onSubmit={handleSignUp}>
        <div className="space-y-3">
          <Label className="text-base font-semibold">I am a...</Label>
          <RadioGroup
            value={role}
            onValueChange={setRole}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="student" id="role-student" className="peer sr-only" />
              <Label
                htmlFor="role-student"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all"
              >
                <GraduationCap className="mb-2 h-6 w-6 text-slate-500 peer-data-[state=checked]:text-indigo-600" />
                <span className="font-medium">Student</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="instructor" id="role-instructor" className="peer sr-only" />
              <Label
                htmlFor="role-instructor"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all"
              >
                <User className="mb-2 h-6 w-6 text-slate-500 peer-data-[state=checked]:text-indigo-600" />
                <span className="font-medium">Instructor</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-signup">Email address</Label>
          <Input
            id="email-signup"
            name="email-signup"
            type="email"
            placeholder="name@company.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <Input
              id="password-signup"
              name="password-signup"
              type="password"
              required
              placeholder="Create a password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              placeholder="Confirm password"
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        {passwordError && <p className="text-sm text-red-500 font-medium">{passwordError}</p>}

        {role === "student" && (
          <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" required disabled={isLoading} className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School or University</Label>
              <Input
                id="school"
                name="school"
                type="text"
                placeholder="e.g., Fusion University"
                required
                disabled={isLoading}
                className="bg-white"
              />
            </div>
          </div>
        )}

        {role === "instructor" && (
          <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <Label htmlFor="expertise">Area of Expertise</Label>
              <Input
                id="expertise"
                name="expertise"
                type="text"
                placeholder="e.g., Data Science, Marketing"
                required
                disabled={isLoading}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization / Company</Label>
              <Input
                id="organization"
                name="organization"
                type="text"
                placeholder="e.g., Tech Corp"
                disabled={isLoading}
                className="bg-white"
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-11 !mt-6 shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Sign Up <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </form>
    </AuthForm>
  );
}


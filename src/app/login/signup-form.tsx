
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle, Loader2, User, GraduationCap, Eye, EyeOff } from "lucide-react";
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
  const role = "student";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          console.log("SignUpForm: Redirecting to target:", target);
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
      title="Candidate Application"
      description="Begin your journey toward institutional mastery and professional distinction."
      footerText="Already have an account?"
      footerLinkText="Sign In"
      onFooterLinkClick={onSwitchToLogin}
    >
      <form className="space-y-8" onSubmit={handleSignUp}>
        <div className="space-y-3">
          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Full Legal Name</Label>
          <Input id="name" name="name" type="text" placeholder="Johnathan Doe" required disabled={isLoading} className="h-16 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-8 font-medium placeholder:text-slate-400 shadow-sm" />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="email-signup" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Email Address</Label>
          <Input
            id="email-signup"
            name="email-signup"
            type="email"
            placeholder="executive@academy.com"
            required
            disabled={isLoading}
            className="h-16 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-8 font-medium placeholder:text-slate-400 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="password-signup" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Security Code</Label>
            <div className="relative">
              <Input
                id="password-signup"
                name="password-signup"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-8 pr-16 font-medium placeholder:text-slate-400 w-full shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3A] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Verify Code</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-16 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-8 pr-16 font-medium placeholder:text-slate-400 w-full shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3A] transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        
        {passwordError && <p className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-4">{passwordError}</p>}

        {role === "student" && (
          <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-8 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500 shadow-inner">
            <div className="space-y-3">
              <Label htmlFor="dob" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" required disabled={isLoading} className="h-16 rounded-full bg-white border-slate-200 px-8 font-medium shadow-sm" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="school" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Previous Institution</Label>
              <Input
                id="school"
                name="school"
                type="text"
                placeholder="e.g., University of Excellence"
                required
                disabled={isLoading}
                className="h-16 rounded-full bg-white border-slate-200 px-8 font-medium placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-16 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all !mt-12" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Apply for Membership <ArrowRight className="ml-3 h-4 w-4" /></>
          )}
        </Button>
      </form>
    </AuthForm>
  );
}


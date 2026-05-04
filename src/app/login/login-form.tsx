
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { AuthForm } from "./auth-form";
import { signInWithEmail } from "@/firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

type LoginFormProps = {
  onSwitchToSignUp?: () => void;
};

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl');
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const { error, user: signedInUser } = await signInWithEmail(email, password);

    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error,
      });
    } else if (signedInUser) {
      // Redirection is now handled by the useEffect below
    }
  };

  // Redirect if user object is available and loading is finished
  React.useEffect(() => {
    if (!userLoading && user) {
      console.log("LoginForm: User loaded, role:", user.role);

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user.role === 'instructor') {
        router.push("/instructor");
      } else if (user.role === 'admin') {
        router.push("/admin");
      } else if (user.role === 'student') {
        router.push("/dashboard");
      } else {
        // If role is missing, stay on the page and log it
        // This prevents the default 'student' redirection for instructors
        console.warn("LoginForm: User authenticated but role is unknown or missing in DB.");
      }
    }
  }, [user, userLoading, router, redirectUrl]);

  return (
    <AuthForm
      title="Institutional Access"
      description="Access your institutional dashboard to manage programs and track academic progress."
      footerText="New to the Academy?"
      footerLinkText="Apply for Admission"
      onFooterLinkClick={onSwitchToSignUp}
    >
      <form className="space-y-8" onSubmit={handleLogin}>
        <div className="space-y-3">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A] ml-4">Email address</Label>
          <Input id="email" name="email" type="email" placeholder="executive@academy.com" required disabled={isLoading} className="h-16 rounded-full bg-slate-50 border-slate-200 focus:bg-white px-8 font-medium placeholder:text-slate-400 shadow-sm" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-4 mr-4">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">Password</Label>
            <Link href="#" className="text-[10px] font-black text-[#1F7A5A] uppercase tracking-widest hover:text-[#0B1F3A] transition-colors">
              Recovery
            </Link>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="••••••••" 
              disabled={isLoading} 
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
        <Button type="submit" className="w-full h-16 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all !mt-12" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Sign In <ArrowRight className="ml-3 h-4 w-4" /></>
          )}
        </Button>
      </form>
    </AuthForm>
  );
}


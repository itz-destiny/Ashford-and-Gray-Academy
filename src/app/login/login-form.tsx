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

const inputClass =
  "h-12 rounded-none border border-slate-200 bg-white px-5 font-medium text-[#0B1F3A] placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:border-[#0B1F3A] transition-colors";

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

    const { error } = await signInWithEmail(email, password);
    setIsLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Login Failed", description: error });
    }
  };

  React.useEffect(() => {
    if (!userLoading && user) {
      const role = (user as any).role as string | undefined;
      // Staff portals always take priority — never follow a redirectUrl that would
      // land a staff member on the wrong portal (e.g. a stale ?redirectUrl=/dashboard).
      if (role === 'admin') { router.push('/admin'); return; }
      if (role === 'instructor') { router.push('/instructor'); return; }
      if (role === 'registrar') { router.push('/registrar'); return; }
      if (role === 'course_registrar') { router.push('/course-registrar'); return; }
      if (role === 'finance') { router.push('/finance'); return; }
      // Students may follow the redirectUrl (e.g. back to a course page they tried to visit).
      if (role === 'student') { router.push(redirectUrl || '/dashboard'); return; }
      // No role yet — route to profile completion.
      const params = new URLSearchParams({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
      });
      router.push(`/login/complete-profile?${params.toString()}`);
    }
  }, [user, userLoading, router, redirectUrl]);

  return (
    <AuthForm
      title="Institutional Access"
      description="Sign in to your academy dashboard to continue your programmes and track academic progress."
      footerText="New to the Academy?"
      footerLinkText="Apply for Admission"
      onFooterLinkClick={onSwitchToSignUp}
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]">Email address</Label>
          <Input id="email" name="email" type="email" placeholder="you@email.com" required disabled={isLoading} className={inputClass} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1F3A]">Password</Label>
            <Link href="/login/reset" className="text-[10px] font-black text-[#0B1F3A] uppercase tracking-[0.2em] hover:text-[#C8A96A] transition-colors border-b border-[#C8A96A] pb-0.5">
              Forgot?
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
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3A] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-none bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-none border-none transition-colors !mt-10"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="ml-3 h-4 w-4" /></>}
        </Button>
      </form>
    </AuthForm>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
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
      title="Welcome Back"
      description="Log in to manage your events and track your learning progress."
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      onFooterLinkClick={onSwitchToSignUp}
    >
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" name="email" type="email" placeholder="name@company.com" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required placeholder="Enter your password" disabled={isLoading} />
        </div>
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Log In <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </form>
    </AuthForm>
  );
}


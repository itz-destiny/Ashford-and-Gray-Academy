
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { AuthForm } from "./auth-form";
import { signInWithEmail } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

type LoginFormProps = {
  onSwitchToSignUp?: () => void;
};

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

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
        // We need to get the role from the user object after sign-in
        // The useUser hook will provide the full user profile including the role
        // For now, we will redirect based on the role we *should* get from Firestore
        // This is a bit of a race condition, but useUser handles the eventual consistency.
        
        // A better approach would be to get the user doc right after login
        // But for now we rely on the `useUser` hook's redirection logic
        // which has been updated.
    }
  };

  // Redirect if user object is available
  React.useEffect(() => {
    if (user) {
      if (user.role === 'instructor') {
        router.push("/instructor");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, router]);

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

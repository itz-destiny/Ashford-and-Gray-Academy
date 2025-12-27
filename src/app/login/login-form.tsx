
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { AuthForm } from "./auth-form";
import React from "react";
import { signInWithEmail } from "@/firebase/auth/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type LoginFormProps = {
  onSwitchToSignUp?: () => void;
};

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const { error } = await signInWithEmail(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error,
      });
    } else {
      router.push("/dashboard");
    }
  };

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
          <Input id="email" name="email" type="email" placeholder="name@company.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required placeholder="Enter your password" />
        </div>
        <Button type="submit" className="w-full h-11">
          Log In <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </AuthForm>
  );
}

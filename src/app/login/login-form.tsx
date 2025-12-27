
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { AuthForm } from "./auth-form";

type LoginFormProps = {
  onSwitchToSignUp?: () => void;
};

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  return (
    <AuthForm
      title="Welcome Back"
      description="Log in to manage your events and track your learning progress."
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      onFooterLinkClick={onSwitchToSignUp}
    >
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="name@company.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Input id="password" type="password" required placeholder="Enter your password" />
        </div>
        <Button type="submit" className="w-full h-11" asChild>
           <Link href="/dashboard">
             Log In <ArrowRight className="ml-2 h-4 w-4" />
           </Link>
        </Button>
      </form>
    </AuthForm>
  );
}

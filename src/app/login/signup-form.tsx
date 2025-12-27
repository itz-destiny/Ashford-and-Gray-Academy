
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { AuthForm } from "./auth-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type SignUpFormProps = {
  onSignUp?: () => void;
};

export function SignUpForm({ onSignUp }: SignUpFormProps) {

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign up logic here
    if (onSignUp) {
      onSignUp();
    }
  }
  return (
    <AuthForm
      title="Create Your Account"
      description="Join our community to start learning and managing events."
      footerText="Already have an account?"
      footerLinkText="Log In"
      onFooterLinkClick={onSignUp}
    >
      <form className="space-y-4" onSubmit={handleSignUp}>
         <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-signup">Email address</Label>
          <Input id="email-signup" type="email" placeholder="name@company.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-signup">Password</Label>
          <Input id="password-signup" type="password" required placeholder="Create a password" />
        </div>
        <div className="space-y-3">
          <Label>I am a...</Label>
          <RadioGroup defaultValue="student" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="student" id="role-student" />
              <Label htmlFor="role-student" className="font-normal">Student</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="instructor" id="role-instructor" />
              <Label htmlFor="role-instructor" className="font-normal">Instructor/Organizer</Label>
            </div>
          </RadioGroup>
        </div>
        <Button type="submit" className="w-full h-11 !mt-6">
          Sign Up <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </AuthForm>
  );
}

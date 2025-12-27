
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { AuthForm } from "./auth-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { signUpWithEmail } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type SignUpFormProps = {
  onSwitchToLogin?: () => void;
};

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [role, setRole] = useState("student");
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email-signup") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password-signup") as HTMLInputElement).value;
    
    // Role-specific data
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
    
    const { error } = await signUpWithEmail(email, password, userData);

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error,
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please log in with your new credentials.",
      });
      if (onSwitchToLogin) {
        onSwitchToLogin();
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
          <Label>I am a...</Label>
          <RadioGroup
            value={role}
            onValueChange={setRole}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="student" id="role-student" />
              <Label htmlFor="role-student" className="font-normal">
                Student
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="instructor" id="role-instructor" />
              <Label htmlFor="role-instructor" className="font-normal">
                Instructor/Organizer
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-signup">Email address</Label>
          <Input
            id="email-signup"
            name="email-signup"
            type="email"
            placeholder="name@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-signup">Password</Label>
          <Input
            id="password-signup"
            name="password-signup"
            type="password"
            required
            placeholder="Create a password"
          />
        </div>

        {role === "student" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School or University</Label>
              <Input
                id="school"
                name="school"
                type="text"
                placeholder="e.g., Fusion University"
                required
              />
            </div>
          </>
        )}

        {role === "instructor" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="expertise">Area of Expertise</Label>
              <Input
                id="expertise"
                name="expertise"
                type="text"
                placeholder="e.g., Data Science, Marketing"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization / Company</Label>
              <Input
                id="organization"
                name="organization"
                type="text"
                placeholder="e.g., Tech Corp"
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full h-11 !mt-6">
          Sign Up <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </AuthForm>
  );
}

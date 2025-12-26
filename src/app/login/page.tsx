
"use client";

import { useState }from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [tab, setTab] = useState("login");

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative flex-col items-center justify-center hidden bg-background md:flex">
        <Image
          src="https://picsum.photos/seed/classroom/1200/1800"
          alt="A modern, bright classroom with students learning"
          fill
          className="object-cover brightness-50"
          data-ai-hint="modern classroom"
        />
        <div className="relative z-10 p-12 text-white max-w-xl mx-auto flex flex-col justify-between h-full">
            <div>
                <Logo className="text-white" />
                <h1 className="text-4xl font-bold mt-16 font-headline">
                    Empowering your learning journey.
                </h1>
                <p className="mt-4 text-lg text-white/80">
                    Join over 50,000 professionals managing their events and tracking progress with our all-in-one platform.
                </p>
            </div>
            <div className="text-sm text-white/70">
                &copy; {new Date().getFullYear()} Ashford & Gray Fusion Academy. All rights reserved. {' '}
                <Link href="#" className="hover:underline">Privacy</Link> &middot; <Link href="#" className="hover:underline">Terms</Link>
            </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-8 bg-secondary">
         <Tabs value={tab} onValueChange={setTab} className="w-full max-w-md">
            <Card className="w-full">
                 <div className="p-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Log In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                 </div>
                <TabsContent value="login">
                    <LoginForm />
                </TabsContent>
                <TabsContent value="signup">
                    <SignUpForm onSignUp={() => setTab("login")} />
                </TabsContent>
            </Card>
        </Tabs>
      </div>
    </div>
  );
}

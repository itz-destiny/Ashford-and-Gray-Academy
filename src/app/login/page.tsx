
"use client";

import React, { useState, useEffect }from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";
import { Card } from "@/components/ui/card";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'signup' ? false : true;
  const [isLoginView, setIsLoginView] = useState(initialView);

  useEffect(() => {
    setIsLoginView(searchParams.get('view') !== 'signup');
  }, [searchParams]);

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
         <Card className="w-full max-w-md">
            {isLoginView ? (
                <LoginForm onSwitchToSignUp={() => setIsLoginView(false)} />
            ) : (
                <SignUpForm onSwitchToLogin={() => setIsLoginView(true)} />
            )}
        </Card>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </React.Suspense>
  )
}

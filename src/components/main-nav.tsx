
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function MainNav() {

  return (
    <header
      className={cn(
        "bg-accent sticky top-0 z-50 transition-all duration-300"
      )}
    >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Logo className="text-white"/>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                <Link href="/courses" className="text-white/80 hover:text-white">Courses</Link>
                <Link href="/events" className="text-white/80 hover:text-white">Events</Link>
                <Link href="/about" className="text-white/80 hover:text-white">About</Link>
            </nav>
            <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                <Link href="/login?view=signup">Sign Up</Link>
                </Button>
            </div>
       </div>
    </header>
  );
}

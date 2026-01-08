
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

import { useUser } from "@/firebase";
import { UserNav } from "@/components/user-nav";

export function MainNav() {
  const { user, loading } = useUser();

  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-50 transition-all duration-300 border-b"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/courses" className="text-muted-foreground hover:text-foreground">Courses</Link>
          <Link href="/events" className="text-muted-foreground hover:text-foreground">Events</Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href={
                  (user as any).role === 'instructor' ? '/instructor' :
                    (user as any).role === 'admin' ? '/admin' :
                      '/dashboard'
                }>Dashboard</Link>
              </Button>
              <UserNav />
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/login?view=signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

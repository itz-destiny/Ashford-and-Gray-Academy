
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { BackButton } from "@/components/back-button";
import { cn } from "@/lib/utils";

import { useUser } from "@/firebase";
import { UserNav } from "@/components/user-nav";

export function MainNav() {
  const { user, loading } = useUser();

  return (
    <header
      className={cn(
        "bg-white sticky top-0 z-50 transition-all duration-300 border-b border-slate-100"
      )}
    >
      <div className="container mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
        </div>
        
        <nav className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">
          <Link href="/courses" className="hover:text-[#1F7A5A] transition-colors">Programs</Link>
          <Link href="/certification" className="hover:text-[#1F7A5A] transition-colors">Certification</Link>
          <Link href="/events" className="hover:text-[#1F7A5A] transition-colors">Events</Link>
          <Link href="/about" className="hover:text-[#1F7A5A] transition-colors">About Us</Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 bg-slate-50 animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-6">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest" asChild>
                <Link href={
                  (user as any).role === 'instructor' ? '/instructor' :
                    (user as any).role === 'admin' ? '/admin' :
                      (user as any).role === 'registrar' ? '/registrar' :
                        (user as any).role === 'course_registrar' ? '/course-registrar' :
                          (user as any).role === 'finance' ? '/finance' :
                            '/dashboard'
                }>Dashboard</Link>
              </Button>
              <UserNav />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-[#0B1F3A] mr-4 hover:text-[#1F7A5A]">Log In</Link>
              <Button size="lg" className="h-12 px-8 rounded-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white font-black text-[10px] uppercase tracking-widest" asChild>
                <Link href="/login?view=signup">Apply Now</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

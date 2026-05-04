
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { UserNav } from "@/components/user-nav";
import { Menu, X, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MainNav() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/courses", label: "Programs" },
    { href: "/certification", label: "Certification" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About Us" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 border-b border-slate-100 h-24">
      <div className="container mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-[#1F7A5A] transition-colors relative group">
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#1F7A5A] transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="h-10 w-24 bg-slate-50 animate-pulse rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-6">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-[#0B1F3A]" asChild>
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
              <div className="flex items-center gap-6">
                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-[#0B1F3A] hover:text-[#1F7A5A] transition-colors">Log In</Link>
                <Button size="lg" className="h-12 px-8 rounded-full bg-[#0B1F3A] hover:bg-[#1F7A5A] text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg" asChild>
                  <Link href="/login?view=signup">Apply Now</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Nav Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full hover:bg-slate-50">
                <Menu className="w-6 h-6 text-[#0B1F3A]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md border-none p-0 bg-[#0B1F3A] text-white">
               <div className="p-12 h-full flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                     <Logo className="w-96 h-96 grayscale invert" />
                  </div>

                  <div className="relative z-10 space-y-16">
                     <SheetHeader className="text-left space-y-2 p-0">
                        <Logo />
                        <SheetTitle className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Global Academic Authority</SheetTitle>
                     </SheetHeader>

                     <nav className="flex flex-col gap-8">
                        {navLinks.map((link, i) => (
                           <Link 
                              key={link.href} 
                              href={link.href} 
                              onClick={() => setIsOpen(false)}
                              className="text-4xl font-serif hover:text-[#C8A96A] transition-all flex items-center group"
                           >
                              <span className="text-[#C8A96A] text-xs font-black mr-6 opacity-40">0{i + 1}</span>
                              {link.label}
                              <ArrowRight className="ml-4 w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C8A96A]" />
                           </Link>
                        ))}
                     </nav>
                  </div>

                  <div className="relative z-10 space-y-8">
                     <div className="h-[1px] bg-white/10 w-full" />
                     {user ? (
                        <Button className="w-full h-16 bg-[#C8A96A] hover:bg-[#B69759] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl" asChild onClick={() => setIsOpen(false)}>
                           <Link href="/dashboard">Access Dashboard</Link>
                        </Button>
                     ) : (
                        <div className="grid grid-cols-2 gap-4">
                           <Button variant="outline" className="h-16 border-white/10 text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest rounded-2xl" asChild onClick={() => setIsOpen(false)}>
                              <Link href="/login">Log In</Link>
                           </Button>
                           <Button className="h-16 bg-white text-[#0B1F3A] hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl" asChild onClick={() => setIsOpen(false)}>
                              <Link href="/login?view=signup">Apply Now</Link>
                           </Button>
                        </div>
                     )}
                     <p className="text-center text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Ashford & Gray Academy • Excellence Refined</p>
                  </div>
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

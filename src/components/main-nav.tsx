
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function MainNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between sticky top-0 z-50 transition-all duration-300",
        scrolled && "bg-background/90 backdrop-blur-sm shadow-md rounded-b-lg"
      )}
    >
      <Logo />
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link href="/courses" className="text-foreground/80 hover:text-foreground">Courses</Link>
        <Link href="/events" className="text-foreground/80 hover:text-foreground">Events</Link>
        <Link href="/about" className="text-foreground/80 hover:text-foreground">About</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Sign Up</Link>
        </Button>
      </div>
    </header>
  );
}

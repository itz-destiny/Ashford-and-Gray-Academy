"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { UserNav } from "@/components/user-nav";
import { Menu, ChevronRight, ArrowUpRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface DropdownItem {
  label: string;
  href: string;
  desc: string;
}

interface PrimaryLink {
  href: string;
  label: string;
  dropdownItems?: DropdownItem[];
}

export function MainNav() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const primaryLinks: PrimaryLink[] = [
    { 
      href: "/academic-programs", 
      label: "Academic Programs",
      dropdownItems: [
        { label: "MBA Program", href: "/mba", desc: "Our signature Executive MBA curriculum (The Silent Standard)." },
        { label: "Diplomas & Programs", href: "/programs", desc: "Elite academic pathways in high-end domestic and hospitality operations." },
        { label: "Executive Education", href: "/executive", desc: "High-level leadership and administrative alignment training for C-Suite." },
        { label: "Professional Certifications", href: "/certifications", desc: "Board-accredited credentials, global diplomacies, and innovation." }
      ]
    },
    { href: "/faculty", label: "Faculty" },
    { 
      href: "/about", 
      label: "About",
      dropdownItems: [
        { label: "Our Vision & Mission", href: "/about", desc: "The elite standards and academic foundations of Ashford & Gray." },
        { label: "Founder's Address", href: "/#founder-address", desc: "Strategic address from Founder & CEO Myne Wilfred." },
        { label: "Registry & Campus", href: "/contact", desc: "Contact our admissions advisors and registrar desk." }
      ]
    },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="w-full sticky top-0 z-50 bg-white shadow-sm transition-all duration-300">
      {/* Main Section Header (White bar) */}
      <header className="bg-white border-b border-slate-100 h-20 w-full">
        <div className="container mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
          </div>
          
          {/* Desktop Nav with Dropdowns */}
          <nav className="hidden xl:flex items-center gap-6 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#0B1F3A] h-full">
            {primaryLinks.map((link, idx) => (
              <div 
                key={link.href}
                className="relative h-full flex items-center"
                onMouseEnter={() => link.dropdownItems && setActiveDropdown(idx)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  href={link.href} 
                  className="hover:text-[#1F7A5A] transition-colors relative py-8 group flex items-center gap-1"
                >
                  <span>{link.label}</span>
                  {link.dropdownItems && (
                    <span className="w-1 h-1 bg-[#C8A96A] rounded-full group-hover:bg-[#1F7A5A] transition-colors" />
                  )}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#C8A96A] transition-all duration-300 group-hover:w-full" />
                </Link>

                {/* HBS-Style Dropdown Menu */}
                {link.dropdownItems && activeDropdown === idx && (
                  <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-slate-100 border-t-4 border-t-[#C8A96A] shadow-xl p-6 space-y-4 animate-fade-in-up">
                    <div className="text-[9px] font-black tracking-widest text-[#C8A96A] border-b border-slate-100 pb-2 mb-2">
                      SELECT SECTION
                    </div>
                    {link.dropdownItems.map((item) => (
                      <Link 
                        key={item.label}
                        href={item.href}
                        className="block group/item space-y-1 text-left"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="text-[#0B1F3A] font-bold text-xs uppercase tracking-wider group-hover/item:text-[#1F7A5A] transition-colors flex items-center gap-1">
                          <span>{item.label}</span>
                          <ArrowUpRight className="w-3 h-3 text-[#C8A96A] opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-[10px] text-[#0B1F3A]/60 font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="h-10 w-24 bg-slate-50 animate-pulse" />
              ) : (
                <Button size="sm" className="h-10 px-8 rounded-none bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 border-none shadow-none" asChild>
                  <Link href="/login?view=signup">Apply</Link>
                </Button>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden rounded-none hover:bg-slate-50">
                  <Menu className="w-6 h-6 text-[#0B1F3A]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md border-none p-0 bg-[#0B1F3A] text-white">
                 <div className="p-8 h-full flex flex-col justify-between overflow-y-auto">
                    <div>
                      <SheetHeader className="text-left space-y-2 p-0 mb-12">
                         <div className="flex justify-between items-center">
                           <Logo variant="white" />
                         </div>
                         <SheetTitle className="text-white/45 text-[9px] font-black uppercase tracking-[0.3em] mt-4">Global Academic Authority</SheetTitle>
                      </SheetHeader>

                      <nav className="flex flex-col gap-6 mb-12">
                         {primaryLinks.map((link, i) => (
                            <Link 
                               key={link.href} 
                               href={link.href} 
                               onClick={() => setIsOpen(false)}
                               className="text-3xl font-serif hover:text-[#C8A96A] transition-all flex items-center justify-between py-2 border-b border-white/5 group"
                            >
                               <span>{link.label}</span>
                               <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#C8A96A] transition-colors" />
                            </Link>
                         ))}
                      </nav>

                      {/* Mobile Utility list */}
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <Link href="/about" onClick={() => setIsOpen(false)} className="block text-xs text-white/60 hover:text-white transition-colors">Our Legacy</Link>
                        <Link href="/faculty" onClick={() => setIsOpen(false)} className="block text-xs text-white/60 hover:text-white transition-colors">Research & Ideas</Link>
                        <Link href="/events" onClick={() => setIsOpen(false)} className="block text-xs text-white/60 hover:text-white transition-colors">Global Forums</Link>
                        <Link href="/newsletter" onClick={() => setIsOpen(false)} className="block text-xs text-white/60 hover:text-white transition-colors">Newsletter Insights</Link>
                      </div>
                    </div>

                    <div className="space-y-6 pt-12">
                       <div className="h-[1px] bg-white/10 w-full" />
                       {user ? (
                          <Button className="w-full h-12 bg-[#C8A96A] hover:bg-[#B69759] text-[#0B1F3A] font-extrabold text-[10px] uppercase tracking-widest rounded-none shadow-none border-none" asChild onClick={() => setIsOpen(false)}>
                             <Link href="/dashboard">Access Dashboard</Link>
                          </Button>
                       ) : (
                          <div className="grid grid-cols-2 gap-4">
                             <Button variant="outline" className="h-12 border-white/10 text-white hover:bg-white/5 font-extrabold text-[10px] uppercase tracking-widest rounded-none" asChild onClick={() => setIsOpen(false)}>
                                <Link href="/login">Log In</Link>
                             </Button>
                             <Button className="h-12 bg-white text-[#0B1F3A] hover:bg-slate-100 font-extrabold text-[10px] uppercase tracking-widest rounded-none" asChild onClick={() => setIsOpen(false)}>
                                <Link href="/login?view=signup">Apply</Link>
                             </Button>
                          </div>
                       )}
                       <p className="text-center text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Ashford & Gray Academy • Ivy Standard</p>
                    </div>
                 </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
}

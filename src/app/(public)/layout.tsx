
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";
import { Instagram, Twitter, Youtube, Database } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsletterForm } from "@/components/newsletter-form";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNav />
      <main className="flex-1">{children}</main>
      <footer className="bg-[#0B1F3A] text-white">
        <div className="container mx-auto px-6 lg:px-12 py-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-8">
              <Logo variant="white" />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Ashford & Gray Fusion Academy is a global leader in professional mastery and executive education.
              </p>
              <div className="flex space-x-6">
                <Link href="#" className="text-slate-400 hover:text-[#C8A96A] transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-[#C8A96A] transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-[#C8A96A] transition-colors">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-8">The Institution</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">Our Legacy</Link></li>
                <li><Link href="/courses" className="text-slate-300 hover:text-white transition-colors">Academic Programs</Link></li>
                <li><Link href="/certification" className="text-slate-300 hover:text-white transition-colors">Certification</Link></li>
                <li><Link href="/events" className="text-slate-300 hover:text-white transition-colors">Global Events</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-8">Admissions</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="#" className="text-slate-300 hover:text-white transition-colors">Apply Now</Link></li>
                <li><Link href="#" className="text-slate-300 hover:text-white transition-colors">Scholarships</Link></li>
                <li><Link href="#" className="text-slate-300 hover:text-white transition-colors">Tuition & Fees</Link></li>
                <li><Link href="#" className="text-slate-300 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-8">Newsletter</h3>
              <p className="text-sm text-slate-400 mb-6">
                Receive curated insights and academic updates.
              </p>
              <div className="space-y-4">
                <NewsletterForm />
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <p>&copy; {new Date().getFullYear()} Ashford & Gray Fusion Academy. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms of Service</Link>
              <Link href="/seed" className="flex items-center hover:text-white"><Database className="mr-2 h-3 w-3" />System</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


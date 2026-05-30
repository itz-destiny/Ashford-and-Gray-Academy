
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";
import { Linkedin } from "lucide-react";
import { FaXTwitter, FaInstagram, FaFacebookF, FaThreads, FaYoutube } from "react-icons/fa6";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsletterForm } from "@/components/newsletter-form";

const SOCIAL_LINKS = [
    { href: "https://www.linkedin.com/in/ashford-gray-85b5a040a", label: "LinkedIn", Icon: Linkedin },
    { href: "https://x.com/AshfordFusion", label: "X", Icon: FaXTwitter },
    { href: "https://www.instagram.com/ashfordgrayacademy?igsh=bGQyMmpiNWU1bXBk", label: "Instagram", Icon: FaInstagram },
    { href: "https://www.facebook.com/share/1H8yi7mBSJ/", label: "Facebook", Icon: FaFacebookF },
    { href: "https://www.threads.com/@ashfordgrayacademy", label: "Threads", Icon: FaThreads },
    { href: "https://youtube.com/@ashfordgray?si=NdmrAITGsPN-abXO", label: "YouTube", Icon: FaYoutube },
];

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
                Where Excellence is Refined, and Leaders are Distinct.<br />
                Mastering Luxury. Elevating Business.
              </p>
              <div className="flex flex-wrap gap-4 max-w-[12rem]">
                {SOCIAL_LINKS.map(s => (
                  <Link key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        title={s.label}
                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#C8A96A] hover:text-[#0B1F3A] text-slate-400 flex items-center justify-center transition-colors">
                    <s.Icon className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-8">The Institution</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/courses" className="text-slate-300 hover:text-white transition-colors">Academic Programs</Link></li>
                <li><Link href="/faculty" className="text-slate-300 hover:text-white transition-colors">Executive Leadership Team</Link></li>
                <li><Link href="/press" className="text-slate-300 hover:text-white transition-colors">Academic Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-8">Admissions</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/login?view=signup" className="text-slate-300 hover:text-white transition-colors">Apply Now</Link></li>
                <li><Link href="/faculty" className="text-slate-300 hover:text-white transition-colors">Executive Leadership Team</Link></li>
                <li><Link href="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/unsubscribe" className="text-slate-300 hover:text-white transition-colors">Newsletter Preferences</Link></li>
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
            <div className="flex flex-wrap gap-6 md:gap-8">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <Link href="/unsubscribe" className="hover:text-white">Unsubscribe</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


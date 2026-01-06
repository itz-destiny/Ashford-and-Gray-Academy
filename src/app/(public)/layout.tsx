
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";
import { Instagram, Twitter, Youtube, Database } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNav />
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo className="text-white" />
              <p className="mt-4 text-primary-foreground/70 text-sm">
                Empowering the future of learning and event management.
              </p>
              <div className="flex space-x-4 mt-4">
                <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
                  <Twitter />
                </Link>
                <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
                  <Instagram />
                </Link>
                <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
                  <Youtube />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Explore</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/courses" className="text-primary-foreground/70 hover:text-primary-foreground">Courses</Link></li>
                <li><Link href="/events" className="text-primary-foreground/70 hover:text-primary-foreground">Events</Link></li>
                <li><Link href="/about" className="text-primary-foreground/70 hover:text-primary-foreground">About Us</Link></li>
                <li><Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">Blog</Link></li>
                 <li><Link href="/seed" className="flex items-center text-primary-foreground/70 hover:text-primary-foreground"><Database className="mr-2 h-4 w-4" />Seed Data</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Support</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">Help Center</Link></li>
                <li><Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">Contact Us</Link></li>
                <li><Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Stay Connected</h3>
              <p className="mt-4 text-sm text-primary-foreground/70">
                Get the latest updates on new courses and upcoming events.
              </p>
              <div className="flex mt-4">
                <Input type="email" placeholder="Enter your email" className="rounded-r-none text-foreground" />
                <Button variant="secondary" className="rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/70">
            <p>&copy; {new Date().getFullYear()} Ashford & Gray. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

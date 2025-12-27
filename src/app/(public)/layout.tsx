import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { Instagram, Mail, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">{children}</main>
      <footer className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="mt-4 text-muted-foreground text-sm">
                Empowering the future of learning and event management.
              </p>
              <div className="flex space-x-4 mt-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Instagram />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Youtube />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Explore</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/courses" className="text-muted-foreground hover:text-foreground">Courses</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Events</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Support</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Stay Connected</h3>
              <p className="mt-4 text-sm text-muted-foreground">
                Get the latest updates on new courses and upcoming events.
              </p>
              <div className="flex mt-4">
                <Input type="email" placeholder="Enter your email" className="rounded-r-none" />
                <Button className="rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Ashford & Gray. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

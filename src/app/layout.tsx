import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Mail, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: "Ashford and Gray Fusion Academy",
  description: "A modern learning platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen">
            <MainNav />
            <main className="flex-1">{children}</main>
            <footer className="bg-background border-t">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  <div className="md:col-span-2">
                    <Logo />
                    <p className="mt-4 text-muted-foreground">
                      Empowering the next generation of learners and leaders through integrated event management.
                    </p>
                    <div className="flex space-x-4 mt-4">
                        <Link href="#"><Mail className="text-muted-foreground hover:text-primary" /></Link>
                        <Link href="#"><Youtube className="text-muted-foreground hover:text-primary" /></Link>
                        <Link href="#"><Twitter className="text-muted-foreground hover:text-primary" /></Link>
                        <Link href="#"><Instagram className="text-muted-foreground hover:text-primary" /></Link>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Platform</h3>
                    <ul className="mt-4 space-y-2">
                      <li><Link href="/courses" className="text-muted-foreground hover:text-primary">Browse Courses</Link></li>
                      <li><Link href="#" className="text-muted-foreground hover:text-primary">Upcoming Events</Link></li>
                      <li><Link href="#" className="text-muted-foreground hover:text-primary">For Instructors</Link></li>
                      <li><Link href="#" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Resources</h3>
                    <ul className="mt-4 space-y-2">
                      <li><Link href="#" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
                      <li><Link href="#" className="text-muted-foreground hover:text-primary">Community</Link></li>
                      <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                      <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Stay Updated</h3>
                    <p className="mt-4 text-muted-foreground text-sm">Join our newsletter for the latest on new courses and features.</p>
                    <form className="mt-4 flex">
                      <Input type="email" placeholder="Enter your email" className="rounded-r-none" />
                      <Button type="submit" className="rounded-l-none">Subscribe</Button>
                    </form>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t flex justify-between items-center text-sm text-muted-foreground">
                  <p>&copy; {new Date().getFullYear()} Ashford & Gray Fusion Academy. All rights reserved.</p>
                  <div className="flex gap-4">
                      <Link href="#" className="hover:text-primary">Privacy Policy</Link>
                      <Link href="#" className="hover:text-primary">Cookie Policy</Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

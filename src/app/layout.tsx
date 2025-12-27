
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { MainNav } from "@/components/main-nav";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";

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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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
            <footer className="bg-secondary">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <Logo />
                    <p className="mt-4 text-muted-foreground text-sm">
                      Empowering the future of learning and event management.
                    </p>
                    <div className="flex space-x-4 mt-4">
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Twitter />
                      </Link>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Instagram />
                      </Link>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Youtube />
                      </Link>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Explore</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>
                        <Link
                          href="/courses"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Courses
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/events"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Events
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/about"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Blog
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Support</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>
                        <Link
                          href="#"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Help Center
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Contact Us
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Stay Connected
                    </h3>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Get the latest updates on new courses and upcoming events.
                    </p>
                    <div className="flex mt-4">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="rounded-r-none"
                      />
                      <Button className="rounded-l-none">Subscribe</Button>
                    </div>
                  </div>
                </div>
                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                  <p>
                    &copy; {new Date().getFullYear()} Ashford & Gray. All rights
                    reserved.
                  </p>
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

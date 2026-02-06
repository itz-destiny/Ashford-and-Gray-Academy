
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import React from "react";

export const metadata: Metadata = {
  title: "Ashford & Gray Fusion Academy",
  description: "Premier online learning platform offering world-class courses in technology, business, and creative arts. Join thousands of students advancing their careers with expert-led instruction.",
  keywords: ["online learning", "education", "courses", "Ashford Gray", "e-learning", "professional development"],
  authors: [{ name: "Ashford & Gray Fusion Academy" }],
  openGraph: {
    title: "Ashford & Gray Fusion Academy",
    description: "Transform your future with world-class online education",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />

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
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

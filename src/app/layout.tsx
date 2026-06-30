
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";
import React from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ashfordandgrayfusionacademy.com"),
  title: {
    default: "Ashford & Gray Fusion Academy — Hospitality Training in Nigeria",
    template: "%s | Ashford & Gray Fusion Academy",
  },
  description:
    "Nigeria's leading hospitality management and luxury service academy. Professional certifications, diplomas, and executive masterclass programmes in hospitality, domestic service, event management, and business leadership — delivered fully online.",
  keywords: [
    "hospitality training Nigeria",
    "hospitality academy Nigeria",
    "hospitality management courses Nigeria",
    "luxury hospitality training",
    "domestic service training Nigeria",
    "event management training Nigeria",
    "hospitality certification Nigeria",
    "professional hospitality courses",
    "Rivers State hospitality academy",
    "Port Harcourt hospitality training",
    "hospitality school Nigeria",
    "executive hospitality training",
    "housekeeping certification Nigeria",
    "butler training Nigeria",
    "protocol and etiquette training Nigeria",
    "Ashford and Gray Fusion Academy",
    "Myne Wilfred",
    "online hospitality courses Africa",
    "luxury service management",
    "hospitality diploma Nigeria",
  ],
  authors: [{ name: "Ashford & Gray Fusion Academy" }],
  creator: "Ashford & Gray Fusion Academy",
  publisher: "Ashford & Gray Fusion Academy",
  category: "Education",
  openGraph: {
    title: "Ashford & Gray Fusion Academy — Hospitality Training in Nigeria",
    description:
      "Nigeria's leading hospitality management academy. Professional certifications, diplomas, and executive masterclass in hospitality, domestic service, event management, and business leadership.",
    url: "https://www.ashfordandgrayfusionacademy.com",
    siteName: "Ashford & Gray Fusion Academy",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Ashford & Gray Fusion Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashford & Gray Fusion Academy — Hospitality Training in Nigeria",
    description:
      "Nigeria's leading hospitality management academy. Certifications, diplomas & executive masterclass in hospitality, domestic service and event management.",
    images: ["/icon.png"],
    site: "@AshfordFusion",
    creator: "@AshfordFusion",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.ashfordandgrayfusionacademy.com",
  },
};

import { GlobalLoaderProvider } from "@/components/global-loader-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <JsonLd data={organizationSchema} />
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <FirebaseClientProvider>
          <GlobalLoaderProvider>
            {children}
          </GlobalLoaderProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

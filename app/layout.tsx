import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StructuredData } from "@/components/structured-data";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: "Markdown to PDF | Free Online Converter with Live Preview",
    template: "%s | Markdown to PDF"
  },
  description: "Convert Markdown to PDF instantly with our free online tool. Features live preview, syntax highlighting, Mermaid diagrams, and client-side processing. No data uploaded to servers.",
  keywords: [
    "markdown to pdf",
    "markdown converter",
    "pdf generator",
    "markdown editor",
    "live preview",
    "mermaid diagrams",
    "syntax highlighting",
    "client-side",
    "free tool",
    "online converter",
    "document converter",
    "markdown processor"
  ],
  authors: [{ name: "Cristian Camilo Correa" }],
  creator: "Cristian Camilo Correa",
  publisher: "Markdown to PDF",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mdtopdf.xyz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mdtopdf.xyz',
    title: 'Markdown to PDF | Free Online Converter with Live Preview',
    description: 'Convert Markdown to PDF instantly with our free online tool. Features live preview, syntax highlighting, Mermaid diagrams, and client-side processing.',
    siteName: 'Markdown to PDF',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Markdown to PDF Converter - Free Online Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markdown to PDF | Free Online Converter',
    description: 'Convert Markdown to PDF instantly with live preview, syntax highlighting, and Mermaid diagrams. Client-side processing ensures privacy.',
    images: ['/og-image.png'],
    creator: '@cristiancamilocorrea',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <StructuredData />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly content" />
      </head>
      <body className={`${inter.className} scroll-gpu transition-ultra`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteConfig } from "@/lib/config";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CraftUsername | Find Your Perfect Identity",
  description: "Check username availability across multiple platforms instantly.",
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headerScripts = "";
  let bodyScripts = "";
  let customSchema = "";
  let siteLogo = "";

  try {
    const { seo } = await getSiteConfig();
    headerScripts = seo.headerScripts || "";
    bodyScripts = seo.bodyScripts || "";
    customSchema = seo.customSchema || "";
    siteLogo = seo.siteLogo || "";
  } catch {
    // Silently fail during build or if DB is unavailable
  }

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Inject header scripts (GTM, analytics, meta verification) */}
        {headerScripts && (
          <script
            dangerouslySetInnerHTML={{
              __html: headerScripts.replace(/<\/?script[^>]*>/gi, ""),
            }}
          />
        )}

        {/* Support meta tags like Google Search Console */}
        {headerScripts && headerScripts.includes("<meta") && (
          <div
            dangerouslySetInnerHTML={{
              __html:
                headerScripts.match(/<meta[^>]*\/?>/gi)?.join("") || "",
            }}
          />
        )}

        {/* Inject custom schema */}
        {customSchema && (
          <div dangerouslySetInnerHTML={{ __html: customSchema }} />
        )}
      </head>

      <body>
        {/* Inject body scripts (GTM noscript etc.) */}
        {bodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: bodyScripts }} />
        )}

        {/* Global Site Logo Header */}
        {siteLogo && (
          <header style={{ position: "absolute", top: 0, left: 0, padding: "1.5rem", zIndex: 50, width: "100%" }}>
            <Link href="/" style={{ display: "inline-block" }}>
              <img 
                src={siteLogo} 
                alt="Website Logo" 
                style={{ 
                  maxHeight: "80px", 
                  width: "auto", 
                  objectFit: "contain",
                  display: "block"
                }} 
              />
            </Link>
          </header>
        )}

        {children}
      </body>
    </html>
  );
}
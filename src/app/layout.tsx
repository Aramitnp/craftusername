import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteConfig } from "@/lib/config";

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

  try {
    const { seo } = await getSiteConfig();
    headerScripts = seo.headerScripts || "";
    bodyScripts = seo.bodyScripts || "";
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
      </head>

      <body>
        {/* Inject body scripts (GTM noscript etc.) */}
        {bodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: bodyScripts }} />
        )}

        {children}
      </body>
    </html>
  );
}
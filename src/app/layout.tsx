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
        {headerScripts && (
          <script
            dangerouslySetInnerHTML={{ __html: headerScripts.replace(/<\/?script[^>]*>/gi, "") }}
          />
        )}
        {/* Also support non-script tags like meta verification */}
        {headerScripts && headerScripts.includes("<meta") && (
          <div dangerouslySetInnerHTML={{ __html: headerScripts.match(/<meta[^>]*\/?>/gi)?.join("") || "" }} />
        )}
      </head>
      <body>
        {bodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: bodyScripts }} />
        )}
        {children}
      </body>
    </html>
  );
}

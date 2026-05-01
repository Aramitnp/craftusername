"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalLogo({ logoUrl }: { logoUrl: string }) {
  const pathname = usePathname();
  
  if (!logoUrl || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header style={{ position: "absolute", top: 0, left: 0, padding: "1.5rem", zIndex: 50, width: "100%", pointerEvents: "none" }}>
      <Link href="/" style={{ display: "inline-block", pointerEvents: "auto" }}>
        <img 
          src={logoUrl} 
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
  );
}

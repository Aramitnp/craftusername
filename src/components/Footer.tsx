import Link from "next/link";
import { getSiteConfig } from "@/lib/config";
import Image from "next/image";

export default async function Footer() {
  const config = await getSiteConfig();
  const footer = config.content.footer;

  if (!footer) return null; // Fallback if somehow not defined

  const brand = footer.brand || {};
  const columns = footer.columns || [];

  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: "var(--color-surface-container-lowest)",
      borderTop: "1px solid var(--color-outline-variant)",
      paddingTop: "4rem",
      paddingBottom: "2rem",
      marginTop: "4rem"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1.5rem",
      }}>
        <div style={{
          display: "grid",
          gap: "2.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          marginBottom: "3rem"
        }} className="footer-grid">
          
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", gridColumn: "span 1" }} className="footer-brand-col">
            <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={config.seo.siteName || "CraftUsername"} 
                  style={{ height: "40px", width: "auto", objectFit: "contain" }} 
                />
              ) : (
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)" }}>
                  {config.seo.siteName || "CraftUsername"}
                </span>
              )}
            </Link>
            {brand.description && (
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.9375rem", lineHeight: 1.6, maxWidth: "300px" }}>
                {brand.description}
              </p>
            )}
          </div>

          {/* Dynamic Columns */}
          {columns.sort((a: any, b: any) => a.sortOrder - b.sortOrder).filter((c: any) => c.isActive).map((col: any) => (
            <div key={col.id} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-on-surface)", margin: 0 }}>
                {col.title}
              </h3>
              <nav aria-label={`${col.title} Navigation`}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(col.links || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).filter((l: any) => l.isActive).map((link: any) => (
                    <li key={link.id}>
                      <Link 
                        href={link.url}
                        target={link.openInNewTab ? "_blank" : undefined}
                        rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                        style={{ 
                          color: "var(--color-on-surface-variant)", 
                          textDecoration: "none", 
                          fontSize: "0.9375rem",
                          transition: "color 0.2s ease"
                        }}
                        className="footer-link"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid var(--color-outline-variant)",
          paddingTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", margin: 0 }}>
            &copy; {currentYear} {config.seo.siteName || "CraftUsername"}. All rights reserved.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .footer-link:hover {
          color: var(--color-primary) !important;
          text-decoration: underline !important;
        }
        
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 1.5fr repeat(3, 1fr) !important;
          }
        }
        
        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .footer-brand-col {
            grid-column: span 2 !important;
            margin-bottom: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-brand-col {
            grid-column: span 1 !important;
          }
        }
      `}} />
    </footer>
  );
}

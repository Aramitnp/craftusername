"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "change-me-now";

export default function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setTimeout(() => setIsAuthenticated(true), 0);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            backgroundColor: "var(--color-surface-container-lowest)",
            padding: "2rem",
            borderRadius: "var(--radius-md)",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h1 className="headline-md" style={{ paddingTop: 0 }}>
            Admin Login
          </h1>
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />
          <Button type="submit" style={{ width: "100%" }}>
            Login
          </Button>
          {error && (
            <p style={{ color: "var(--color-on-error-container)", marginTop: "1rem" }}>
              {error}
            </p>
          )}
        </form>
      </div>
    );
  }

  const navItems = [
    { label: "Platforms", path: "/admin/platforms" },
    { label: "Pages", path: "/admin/pages" },
    { label: "Blog Posts", path: "/admin/blog" },
    { label: "Blog Categories", path: "/admin/blog/categories" },
    { label: "Blog Tags", path: "/admin/blog/tags" },
    { label: "Media", path: "/admin/media" },
    { label: "Content", path: "/admin/content" },
    { label: "SEO", path: "/admin/seo" },
    { label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div style={{ backgroundColor: "var(--color-surface)", minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: "250px",
          backgroundColor: "var(--color-surface-container-lowest)",
          borderRight: "1px solid var(--color-surface-container)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-surface-container)" }}>
          <h2 style={{ color: "var(--color-primary)", fontWeight: "bold", fontSize: "1.25rem", margin: 0 }}>
            CraftUsername
          </h2>
          <span className="label-md" style={{ color: "var(--color-on-surface-variant)" }}>
            Admin Panel
          </span>
        </div>

        <nav style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                    color: isActive ? "var(--color-on-primary)" : "var(--color-on-surface)",
                    fontWeight: isActive ? 600 : 500,
                    transition: "background-color 0.2s",
                  }}
                >
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1rem", borderTop: "1px solid var(--color-surface-container)" }}>
          <Button
            variant="ghost"
            style={{ width: "100%", justifyContent: "flex-start" }}
            onClick={() => {
              localStorage.removeItem("adminAuth");
              setIsAuthenticated(false);
            }}
          >
            Logout
          </Button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
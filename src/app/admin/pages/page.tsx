"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminPagesList() {
  const [pages, setPages] = useState<any[]>([]);

  const fetchPages = () => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPages(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const deletePage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await fetch(`/api/pages/${id}`, { method: "DELETE" });
      fetchPages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>Custom Pages</h1>
          <p style={{ color: "var(--color-on-surface-variant)" }}>Manage your SEO-optimized custom pages.</p>
        </div>
        <Link href="/admin/pages/add">
          <Button>Add New Page</Button>
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {pages.map((page) => (
          <Card key={page.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: "1.125rem", display: "block", color: "var(--color-primary)", marginBottom: "0.25rem" }}>
                {page.title}
              </span>
              <span className="label-md" style={{ color: "var(--color-on-surface-variant)", textTransform: "none", display: "flex", gap: "1rem" }}>
                <span>Slug: /{page.slug}</span>
                <span>Created: {new Date(page.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Badge status={page.status === "PUBLISHED" ? "Available" : "Taken"} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/admin/pages/${page.id}/edit`}>
                  <Button variant="secondary" style={{ padding: "0.5rem 1rem" }}>Edit</Button>
                </Link>
                <Button variant="ghost" onClick={() => deletePage(page.id)} style={{ padding: "0.5rem 1rem" }}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
        {pages.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "1rem" }}>No pages found.</p>
            <Link href="/admin/pages/add">
              <Button>Create your first page</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

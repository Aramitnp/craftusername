"use client";

import Link from "next/link";
import PageForm from "@/components/PageForm";

export default function AddPage() {
  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/pages" style={{ color: "var(--color-primary)", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Back to Pages
        </Link>
        <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>Add New Page</h1>
        <p style={{ color: "var(--color-on-surface-variant)" }}>Create a new custom page for your website.</p>
      </div>

      <PageForm />
    </div>
  );
}

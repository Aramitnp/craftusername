"use client";

import Link from "next/link";
import BlogForm from "@/components/BlogForm";

export default function AddBlogPost() {
  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/blog" style={{ color: "var(--color-primary)", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Back to Blog Posts
        </Link>
        <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>Add New Blog Post</h1>
        <p style={{ color: "var(--color-on-surface-variant)" }}>Create a new article for your blog.</p>
      </div>

      <BlogForm />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BlogForm from "@/components/BlogForm";

export default function EditBlogPost() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/blog/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setPost(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [params?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post || post.error) {
    return <div>Blog post not found.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/blog" style={{ color: "var(--color-primary)", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Back to Blog Posts
        </Link>
        <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>Edit Blog Post: {post.title}</h1>
        <p style={{ color: "var(--color-on-surface-variant)" }}>Update your article content and SEO settings.</p>
      </div>

      <BlogForm initialData={post} />
    </div>
  );
}

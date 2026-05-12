"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageForm from "@/components/PageForm";

export default function EditPage() {
  const params = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/pages/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setPage(data);
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

  if (!page || page.error) {
    return <div>Page not found.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/pages" style={{ color: "var(--color-primary)", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Back to Pages
        </Link>
        <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>Edit Page: {page.title}</h1>
        <p style={{ color: "var(--color-on-surface-variant)" }}>Update your custom page content and SEO settings.</p>
      </div>

      <PageForm initialData={page} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import RichTextEditor from "./RichTextEditor";
import SeoPreview from "./SeoPreview";
import MediaPicker from "./MediaPicker";

interface PageFormProps {
  initialData?: any;
}

export default function PageForm({ initialData }: PageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    openGraphTitle: initialData?.openGraphTitle || "",
    openGraphDesc: initialData?.openGraphDesc || "",
    openGraphImage: initialData?.openGraphImage || "",
    featuredImage: initialData?.featuredImage || "",
    featuredImageAlt: initialData?.featuredImageAlt || "",
    content: initialData?.content || "",
    status: initialData?.status || "DRAFT",
    robots: initialData?.robots || "index, follow",
  });

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const checkWarnings = () => {
    const newWarnings: string[] = [];
    if (!formData.seoTitle) newWarnings.push("Missing SEO title.");
    if (!formData.seoDescription) newWarnings.push("Missing meta description.");
    if (!formData.slug) newWarnings.push("Slug is missing.");
    if (formData.featuredImage && !formData.featuredImageAlt) newWarnings.push("Missing featured image alt text.");
    
    // Content checks
    const wordCount = formData.content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter((w: string) => w.length > 0).length;
    if (wordCount < 300 && formData.status === "PUBLISHED") newWarnings.push("Content body is under 300 words.");
    if (!formData.content.includes("<h2>")) newWarnings.push("Missing H2 headings in content.");
    if ((formData.content.match(/<h1/g) || []).length > 1) newWarnings.push("Multiple H1 tags detected in content. Use H2/H3 instead.");
    if (formData.slug.length > 60) newWarnings.push("Slug is too long (over 60 characters).");

    setWarnings(newWarnings);
  };

  useEffect(() => {
    setTimeout(() => checkWarnings(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isEditing ? `/api/pages/${initialData.id}` : "/api/pages";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/pages");
        router.refresh();
      } else {
        alert("Failed to save page.");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {warnings.length > 0 && (
        <div style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>SEO & Content Warnings:</h4>
          <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <Card>
            <h3 className="headline-sm">Basic Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label className="label-md">Page Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title: newTitle,
                      slug: prev.slug === generateSlug(prev.title) ? generateSlug(newTitle) : prev.slug
                    }));
                  }}
                  required
                />
              </div>
              <div>
                <label className="label-md">URL Slug (e.g. custom-page-slug)</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label-md">Content Body</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="headline-sm">SEO Meta Data</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label className="label-md">SEO Title</label>
                <Input
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="label-md">SEO Meta Description</label>
                <textarea
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", minHeight: "80px", fontFamily: "inherit" }}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                />
              </div>
              
              <SeoPreview
                title={formData.seoTitle || formData.title}
                description={formData.seoDescription}
                slug={formData.slug}
              />
            </div>
          </Card>

          <Card>
            <h3 className="headline-sm">Open Graph (Social Sharing)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label className="label-md">Open Graph Title</label>
                <Input
                  value={formData.openGraphTitle}
                  onChange={(e) => setFormData({ ...formData, openGraphTitle: e.target.value })}
                  placeholder="Defaults to SEO Title"
                />
              </div>
              <div>
                <label className="label-md">Open Graph Description</label>
                <textarea
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", minHeight: "80px", fontFamily: "inherit" }}
                  value={formData.openGraphDesc}
                  onChange={(e) => setFormData({ ...formData, openGraphDesc: e.target.value })}
                  placeholder="Defaults to Meta Description"
                />
              </div>
              <div>
                <label className="label-md">Open Graph Image</label>
                <MediaPicker
                  currentUrl={formData.openGraphImage}
                  onSelect={(url) => setFormData({ ...formData, openGraphImage: url })}
                />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <Card>
            <h3 className="headline-sm">Publishing</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label className="label-md">Status</label>
                <select
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div>
                <label className="label-md">Robots Meta</label>
                <select
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
                  value={formData.robots}
                  onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="headline-sm">Featured Image</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <MediaPicker
                currentUrl={formData.featuredImage}
                onSelect={(url) => setFormData({ ...formData, featuredImage: url })}
              />
              <div>
                <label className="label-md">Featured Image Alt Text</label>
                <Input
                  value={formData.featuredImageAlt}
                  onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-outline)" }}>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/pages")}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Page" : "Create Page"}
        </Button>
      </div>
    </form>
  );
}

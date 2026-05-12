"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import SeoPreview from "@/components/SeoPreview";
import MediaPicker from "@/components/MediaPicker";

interface CategoryFormProps {
  initialData?: any;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    featuredImage: initialData?.featuredImage || "",
    featuredImageAlt: initialData?.featuredImageAlt || "",
    status: initialData?.status || "ACTIVE",
    robots: initialData?.robots || "index, follow",
  });

  const checkWarnings = () => {
    const newWarnings: string[] = [];
    if (!formData.seoTitle) newWarnings.push("Missing SEO Title");
    if (!formData.seoDescription) newWarnings.push("Missing SEO Meta Description");
    if (!formData.description) newWarnings.push("Missing Frontend Description");
    if (formData.slug.length > 60) newWarnings.push("Slug is very long (> 60 characters)");
    setWarnings(newWarnings);
  };

  useEffect(() => {
    setTimeout(() => checkWarnings(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!initialData) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(initialData ? `/api/blog/categories/${initialData.id}` : `/api/blog/categories`, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/blog/categories");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save category");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {warnings.length > 0 && (
        <div style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
          <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>SEO Warnings:</h4>
          <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <Card>
            <h3 className="headline-sm">Basic Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
              <div>
                <label className="label-md" style={{ marginBottom: "0.5rem", display: "block" }}>Category Name</label>
                <Input required value={formData.name} onChange={handleNameChange} placeholder="e.g. Social Media" />
              </div>
              
              <div>
                <label className="label-md" style={{ marginBottom: "0.5rem", display: "block" }}>URL Slug</label>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "var(--color-surface-container-lowest)" }}>
                  <span style={{ padding: "0.75rem 1rem", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", borderRight: "1px solid var(--color-outline)" }}>
                    craftusername.com/category/
                  </span>
                  <input 
                    required 
                    type="text" 
                    value={formData.slug} 
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") })} 
                    style={{ flexGrow: 1, padding: "0.75rem", border: "none", outline: "none", backgroundColor: "transparent", fontSize: "1rem", color: "var(--color-on-surface)" }} 
                  />
                </div>
              </div>

              <div>
                <label className="label-md" style={{ marginBottom: "0.5rem", display: "block" }}>Frontend Description</label>
                <textarea 
                  required 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Short, user-friendly description displayed at the top of the archive page." 
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", minHeight: "80px", fontFamily: "inherit" }} 
                />
              </div>
              
              <div>
                <label className="label-md" style={{ marginBottom: "0.5rem", display: "block" }}>Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", backgroundColor: "var(--color-surface)" }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="headline-sm">SEO Metadata</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <label className="label-md">SEO Title</label>
                  <span style={{ fontSize: "0.75rem", color: formData.seoTitle.length > 60 ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
                    {formData.seoTitle.length} / 60
                  </span>
                </div>
                <Input value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <label className="label-md">SEO Meta Description</label>
                  <span style={{ fontSize: "0.75rem", color: formData.seoDescription.length > 160 ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
                    {formData.seoDescription.length} / 160
                  </span>
                </div>
                <textarea 
                  value={formData.seoDescription} 
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} 
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", minHeight: "80px", fontFamily: "inherit" }} 
                />
              </div>

              <SeoPreview
                title={formData.seoTitle || formData.name}
                description={formData.seoDescription || formData.description}
                slug={`category/${formData.slug}`}
              />
              
              <div>
                <label className="label-md" style={{ marginBottom: "0.5rem", display: "block" }}>Robots Meta</label>
                <select 
                  value={formData.robots} 
                  onChange={(e) => setFormData({ ...formData, robots: e.target.value })} 
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", backgroundColor: "var(--color-surface)" }}
                >
                  <option value="index, follow">index, follow (Default for Categories)</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <Card>
            <h3 className="headline-sm">Social Sharing</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
              <div>
                <label className="label-md" style={{ marginBottom: "0.5rem", display: "block" }}>Open Graph Image</label>
                <MediaPicker
                  currentUrl={formData.featuredImage}
                  onSelect={(url) => setFormData({ ...formData, featuredImage: url })}
                />
              </div>
              <div>
                <label className="label-md" style={{ marginBottom: "0.5rem", display: "block" }}>Image Alt Text</label>
                <Input value={formData.featuredImageAlt} onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-outline)" }}>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/blog/categories")}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}

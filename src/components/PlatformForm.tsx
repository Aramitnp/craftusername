"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import MediaPicker from "@/components/MediaPicker";

interface PlatformFormProps {
  initialData?: any;
  isEdit?: boolean;
}

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-primary)" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {children}
      </div>
    </div>
  );
}

export default function PlatformForm({ initialData, isEdit }: PlatformFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    logo: initialData?.logo || "",
    profileUrlPattern: initialData?.profileUrlPattern || "",
    checkMethod: initialData?.checkMethod || "GET",
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder || 0,
    seoTitleOverride: initialData?.seoTitleOverride || "",
    seoDescOverride: initialData?.seoDescOverride || "",
    contentTitle: initialData?.contentTitle || "",
    contentBody: initialData?.contentBody || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/platforms/${initialData.id}` : "/api/platforms";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sortOrder: Number(formData.sortOrder),
        }),
      });

      if (!res.ok) throw new Error("Failed to save platform");
      router.push("/admin/platforms");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "800px" }}>
      <FormGroup title="Identity Settings">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Platform Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Instagram" />
          </div>
          <div>
            <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Slug (unique identifier)</label>
            <Input name="slug" value={formData.slug} onChange={handleChange} required placeholder="e.g. instagram" />
          </div>
        </div>

        <div>
          <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Logo Image URL</label>
          <Input name="logo" value={formData.logo} onChange={handleChange} placeholder="https://example.com/logo.png" />
          <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.5rem" }}>Paste a URL directly, or pick from your uploaded media below.</p>
          <MediaPicker
            currentUrl={formData.logo}
            onSelect={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
          />
        </div>
      </FormGroup>

      <FormGroup title="Engine &amp; Checking Strategy">
        <div>
          <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Profile URL Pattern</label>
          <Input name="profileUrlPattern" value={formData.profileUrlPattern} onChange={handleChange} required placeholder="https://instagram.com/{username}" />
          <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.5rem" }}>Use <code style={{ backgroundColor: "var(--color-surface)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>{'{username}'}</code> as the placeholder for where the searched text should go.</p>
        </div>

        <div>
          <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Check Method</label>
          <select 
            name="checkMethod" 
            value={formData.checkMethod} 
            onChange={handleChange}
            style={{ width: "100%", padding: "1rem", borderRadius: "var(--radius-md)", border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)", fontFamily: "var(--font-inter)", fontSize: "1rem" }}
          >
            <option value="GET">HTTP GET (Most reliable, downloads full page)</option>
            <option value="HEAD">HTTP HEAD (Faster, only fetches headers)</option>
          </select>
          <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.5rem" }}>Determine how the server queries this platform to check availability.</p>
        </div>
      </FormGroup>

      <FormGroup title="Display Settings">
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Sort Order</label>
            <Input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} />
            <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.5rem" }}>Lower numbers appear first.</p>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "var(--color-surface)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" style={{ width: "20px", height: "20px" }} />
            <div>
              <label htmlFor="isActive" style={{ fontWeight: 600, cursor: "pointer", display: "block" }}>Platform Active</label>
              <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", margin: 0 }}>Uncheck to temporarily hide from public.</p>
            </div>
          </div>
        </div>
      </FormGroup>

      <FormGroup title="SEO & Page Content">
        <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", margin: "-0.5rem 0 0.5rem" }}>Optional. Override auto-generated SEO or add custom content below the checker on this platform's page.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>SEO Title Override</label>
            <Input name="seoTitleOverride" value={formData.seoTitleOverride} onChange={handleChange} placeholder="Leave empty to use template" />
          </div>
          <div>
            <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>SEO Description Override</label>
            <Input name="seoDescOverride" value={formData.seoDescOverride} onChange={handleChange} placeholder="Leave empty to use template" />
          </div>
        </div>
        <div>
          <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Content Title</label>
          <Input name="contentTitle" value={formData.contentTitle} onChange={handleChange} placeholder={`e.g. About ${formData.name || 'Platform'} Username Checker`} />
          <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}>Heading shown below the checker tool on this platform's page.</p>
        </div>
        <div>
          <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Content Body</label>
          <textarea
            name="contentBody"
            value={formData.contentBody}
            onChange={(e) => setFormData((prev) => ({ ...prev, contentBody: e.target.value }))}
            placeholder="Write SEO content about checking usernames on this platform..."
            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)", fontFamily: "var(--font-inter)", fontSize: "0.9375rem", minHeight: "120px", resize: "vertical" }}
          />
          <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}>Paragraph shown below the checker. Leave empty for auto-generated fallback.</p>
        </div>
      </FormGroup>

      {error && <div style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "1rem" }}>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/platforms")} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving Platform..." : "Save Platform Configuration"}</Button>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminSeoPage() {
  const [seo, setSeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.seo) {
          setMessage(data.error || "Failed to load SEO configuration.");
          setLoading(false);
          return;
        }
        setSeo(data.seo);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Error connecting to server.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setSeo({ ...seo, [field]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo }),
      });
      if (res.ok) setMessage("SEO settings saved successfully!");
      else setMessage("Failed to save.");
    } catch {
      setMessage("Error saving.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!seo) return (
    <div>
      <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "2rem" }}>SEO Settings</h1>
      <p style={{ color: "var(--color-on-error-container)", padding: "1rem", backgroundColor: "var(--color-error-container)", borderRadius: "var(--radius-md)" }}>
        {message}
      </p>
    </div>
  );

  const textareaStyle = { width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)", fontFamily: "var(--font-inter)", fontSize: "0.9375rem", minHeight: "80px", resize: "vertical" as const };

  return (
    <div>
      <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "2rem" }}>SEO Settings</h1>
      
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "800px" }}>
        
        {/* Homepage Meta */}
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Homepage Meta Tags</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Title</label>
              <Input value={seo.mainTitle || ""} onChange={(e) => handleChange(e, "mainTitle")} required />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Meta Description</label>
              <textarea value={seo.mainDescription || ""} onChange={(e) => handleChange(e, "mainDescription")} required style={textareaStyle} />
            </div>
          </div>
        </div>

        {/* Homepage OG */}
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Homepage Open Graph</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1rem" }}>Controls how the homepage looks when shared on social media.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>OG Title</label>
              <Input value={seo.ogTitle || ""} onChange={(e) => handleChange(e, "ogTitle")} placeholder="Falls back to main title if empty" />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>OG Description</label>
              <textarea value={seo.ogDescription || ""} onChange={(e) => handleChange(e, "ogDescription")} placeholder="Falls back to meta description if empty" style={textareaStyle} />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>OG Image URL</label>
              <Input value={seo.ogImage || ""} onChange={(e) => handleChange(e, "ogImage")} placeholder="https://craftusername.com/og-image.png" />
              <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}>Recommended: 1200×630px image.</p>
            </div>
          </div>
        </div>

        {/* Platform Meta Templates */}
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Platform Page Templates</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Use <code style={{ backgroundColor: "var(--color-surface)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>{'{Platform}'}</code> for platform name and <code style={{ backgroundColor: "var(--color-surface)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>{'{Brand}'}</code> for site name.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Title Template</label>
              <Input value={seo.platformTitleTemplate || ""} onChange={(e) => handleChange(e, "platformTitleTemplate")} required />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Description Template</label>
              <textarea value={seo.platformDescriptionTemplate || ""} onChange={(e) => handleChange(e, "platformDescriptionTemplate")} required style={textareaStyle} />
            </div>
          </div>
        </div>

        {/* Platform OG Templates */}
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Platform Open Graph Templates</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>OG Title Template</label>
              <Input value={seo.platformOgTitleTemplate || ""} onChange={(e) => handleChange(e, "platformOgTitleTemplate")} />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>OG Description Template</label>
              <textarea value={seo.platformOgDescTemplate || ""} onChange={(e) => handleChange(e, "platformOgDescTemplate")} style={textareaStyle} />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Platform OG Image URL</label>
              <Input value={seo.platformOgImage || ""} onChange={(e) => handleChange(e, "platformOgImage")} placeholder="Shared OG image for all platform pages" />
            </div>
          </div>
        </div>

        {message && <div style={{ padding: "1rem", backgroundColor: "var(--color-surface-container)", borderRadius: "var(--radius-md)", color: "var(--color-primary)", fontWeight: 600 }}>{message}</div>}

        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save SEO Settings"}</Button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const [seo, setSeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.seo) {
          setMessage(data.error || "Failed to load Settings. Try restarting your development server.");
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
      if (res.ok) setMessage("Settings saved successfully!");
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
      <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "2rem" }}>Global Settings</h1>
      <p style={{ color: "var(--color-on-error-container)", padding: "1rem", backgroundColor: "var(--color-error-container)", borderRadius: "var(--radius-md)" }}>
        {message}
      </p>
    </div>
  );

  const textareaStyle = { width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)", fontFamily: "monospace", fontSize: "0.8125rem", minHeight: "120px", resize: "vertical" as const, lineHeight: 1.6 };

  return (
    <div>
      <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "2rem" }}>Global Settings</h1>
      
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "800px" }}>
        
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Site Identity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Site Name</label>
              <Input value={seo.siteName || ""} onChange={(e) => handleChange(e, "siteName")} required />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Canonical Domain URL</label>
              <Input value={seo.canonicalUrl || ""} onChange={(e) => handleChange(e, "canonicalUrl")} required placeholder="https://example.com" />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>Script Injection</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Paste tracking scripts here. Supports Google Tag Manager, Google Analytics, Search Console verification, and any other third-party scripts.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Header Scripts <span style={{ color: "var(--color-on-surface-variant)", fontWeight: 400 }}>(injected inside &lt;head&gt;)</span></label>
              <textarea
                value={seo.headerScripts || ""}
                onChange={(e) => handleChange(e, "headerScripts")}
                placeholder={"<!-- Google Tag Manager -->\n<script>...</script>\n<!-- End Google Tag Manager -->"}
                style={textareaStyle}
              />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Body Scripts <span style={{ color: "var(--color-on-surface-variant)", fontWeight: 400 }}>(injected after &lt;body&gt; opens)</span></label>
              <textarea
                value={seo.bodyScripts || ""}
                onChange={(e) => handleChange(e, "bodyScripts")}
                placeholder={"<!-- Google Tag Manager (noscript) -->\n<noscript>...</noscript>\n<!-- End Google Tag Manager (noscript) -->"}
                style={textareaStyle}
              />
            </div>
          </div>
        </div>

        {message && <div style={{ padding: "1rem", backgroundColor: "var(--color-surface-container)", borderRadius: "var(--radius-md)", color: "var(--color-primary)", fontWeight: 600 }}>{message}</div>}

        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
      </form>
    </div>
  );
}

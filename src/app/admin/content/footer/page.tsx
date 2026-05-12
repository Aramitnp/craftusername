"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface FooterLink {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface FooterColumn {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
  links: FooterLink[];
}

export default function AdminFooterPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !data.content) {
          setMessage(data.error || "Failed to load configuration.");
          setLoading(false);
          return;
        }
        setContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        setMessage("Error connecting to server.");
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) setMessage("Footer settings saved successfully!");
      else setMessage("Failed to save.");
    } catch (err) {
      setMessage("Error saving.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updateFooter = (newFooter: any) => {
    setContent({ ...content, footer: newFooter });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  if (loading) return <p>Loading...</p>;
  if (!content) return <p>{message}</p>;

  const footer = content.footer || { brand: { logo: "", description: "" }, columns: [] };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/content" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 500 }}>
          &larr; Back to Content
        </Link>
        <h1 className="headline-md" style={{ paddingTop: 0, margin: 0 }}>Footer Management</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px" }}>
        
        {/* Brand Section */}
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Brand Section</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Footer Logo URL (Optional)</label>
              <Input
                value={footer.brand?.logo || ""}
                onChange={(e) => updateFooter({ ...footer, brand: { ...footer.brand, logo: e.target.value } })}
                placeholder="/logo.png or full URL"
              />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Brand Description</label>
              <textarea
                value={footer.brand?.description || ""}
                onChange={(e) => updateFooter({ ...footer, brand: { ...footer.brand, description: e.target.value } })}
                style={{
                  width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)",
                  border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)",
                  fontFamily: "var(--font-inter)", fontSize: "0.9375rem", minHeight: "80px", resize: "vertical"
                }}
              />
            </div>
          </div>
        </div>

        {/* Columns Section */}
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", margin: 0 }}>Footer Columns</h2>
            <Button
              type="button"
              onClick={() => {
                const newCol: FooterColumn = {
                  id: generateId(),
                  title: "New Column",
                  sortOrder: footer.columns.length + 1,
                  isActive: true,
                  links: [],
                };
                updateFooter({ ...footer, columns: [...footer.columns, newCol] });
              }}
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
            >
              + Add Column
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {(footer.columns || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((col: FooterColumn, colIndex: number) => (
              <div key={col.id} style={{ backgroundColor: "var(--color-surface-container)", padding: "1.25rem", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--color-primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "1rem" }}>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 80px auto", gap: "1rem", alignItems: "end" }}>
                    <div>
                      <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Column Title</label>
                      <Input
                        value={col.title}
                        onChange={(e) => {
                          const cols = [...footer.columns];
                          cols[colIndex].title = e.target.value;
                          updateFooter({ ...footer, columns: cols });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Order</label>
                      <Input
                        type="number"
                        value={col.sortOrder}
                        onChange={(e) => {
                          const cols = [...footer.columns];
                          cols[colIndex].sortOrder = parseInt(e.target.value) || 0;
                          updateFooter({ ...footer, columns: cols });
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "42px" }}>
                      <input
                        type="checkbox"
                        checked={col.isActive}
                        onChange={(e) => {
                          const cols = [...footer.columns];
                          cols[colIndex].isActive = e.target.checked;
                          updateFooter({ ...footer, columns: cols });
                        }}
                        id={`active-${col.id}`}
                      />
                      <label htmlFor={`active-${col.id}`} style={{ fontSize: "0.875rem" }}>Active</label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this column and all its links?")) {
                        const cols = footer.columns.filter((c: any) => c.id !== col.id);
                        updateFooter({ ...footer, columns: cols });
                      }
                    }}
                    style={{ background: "none", border: "none", color: "var(--color-error, #d32f2f)", cursor: "pointer", fontWeight: 600, padding: "0.5rem" }}
                  >
                    Delete Column
                  </button>
                </div>

                {/* Links within Column */}
                <div style={{ marginLeft: "1rem", paddingLeft: "1rem", borderLeft: "2px solid var(--color-outline-variant)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", color: "var(--color-on-surface)", margin: 0 }}>Links</h3>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const cols = [...footer.columns];
                        cols[colIndex].links.push({
                          id: generateId(),
                          label: "New Link",
                          url: "/",
                          openInNewTab: false,
                          sortOrder: cols[colIndex].links.length + 1,
                          isActive: true,
                        });
                        updateFooter({ ...footer, columns: cols });
                      }}
                      style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                    >
                      + Add Link
                    </Button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {(col.links || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((link: FooterLink, linkIndex: number) => (
                      <div key={link.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center", backgroundColor: "var(--color-surface-container-highest)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                        <div style={{ flex: 1 }}>
                          <Input
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => {
                              const cols = [...footer.columns];
                              cols[colIndex].links[linkIndex].label = e.target.value;
                              updateFooter({ ...footer, columns: cols });
                            }}
                            required
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Input
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => {
                              const cols = [...footer.columns];
                              cols[colIndex].links[linkIndex].url = e.target.value;
                              updateFooter({ ...footer, columns: cols });
                            }}
                            required
                          />
                        </div>
                        <div style={{ width: "60px" }}>
                          <Input
                            type="number"
                            placeholder="Order"
                            value={link.sortOrder}
                            onChange={(e) => {
                              const cols = [...footer.columns];
                              cols[colIndex].links[linkIndex].sortOrder = parseInt(e.target.value) || 0;
                              updateFooter({ ...footer, columns: cols });
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.75rem" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <input
                              type="checkbox"
                              checked={link.isActive}
                              onChange={(e) => {
                                const cols = [...footer.columns];
                                cols[colIndex].links[linkIndex].isActive = e.target.checked;
                                updateFooter({ ...footer, columns: cols });
                              }}
                            /> Active
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <input
                              type="checkbox"
                              checked={link.openInNewTab}
                              onChange={(e) => {
                                const cols = [...footer.columns];
                                cols[colIndex].links[linkIndex].openInNewTab = e.target.checked;
                                updateFooter({ ...footer, columns: cols });
                              }}
                            /> New Tab
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const cols = [...footer.columns];
                            cols[colIndex].links = cols[colIndex].links.filter((l: any) => l.id !== link.id);
                            updateFooter({ ...footer, columns: cols });
                          }}
                          style={{ background: "none", border: "none", color: "var(--color-error, #d32f2f)", cursor: "pointer", padding: "0.25rem" }}
                          title="Delete Link"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {col.links.length === 0 && (
                      <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", margin: 0 }}>No links in this column.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {footer.columns.length === 0 && (
              <p style={{ color: "var(--color-on-surface-variant)", textAlign: "center", padding: "2rem 0" }}>
                No footer columns configured.
              </p>
            )}
          </div>
        </div>

        {message && <div style={{ padding: "1rem", backgroundColor: "var(--color-surface-container)", borderRadius: "var(--radius-md)", color: "var(--color-primary)", fontWeight: 600 }}>{message}</div>}

        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Footer Settings"}</Button>
      </form>
    </div>
  );
}

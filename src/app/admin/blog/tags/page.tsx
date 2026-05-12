"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Tag, LayoutGrid, Search } from "lucide-react";

export default function AdminTagList() {
  const [tags, setTags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTags = () => {
    fetch("/api/blog/tags")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTags(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const deleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag? It will be removed from all posts.")) return;
    try {
      const res = await fetch(`/api/blog/tags/${id}`, { method: "DELETE" });
      if (res.ok) fetchTags();
      else alert("Failed to delete");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.slug.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>Blog Tags</h1>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Manage flexible keywords to organize your posts.</p>
        </div>
        <Link href="/admin/blog/tags/add">
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)",
            padding: "0.75rem 1.25rem", borderRadius: "9999px", border: "none",
            fontWeight: 500, fontSize: "0.9375rem", cursor: "pointer", transition: "background-color 0.2s"
          }}>
            <Plus size={18} />
            <span>Add Tag</span>
          </button>
        </Link>
      </div>

      {tags.length > 0 && (
        <div style={{ marginBottom: "1.5rem", position: "relative", maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-variant)" }} />
          <input 
            type="text" 
            placeholder="Search tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem",
              borderRadius: "1rem", border: "1px solid var(--color-outline-variant)",
              backgroundColor: "var(--color-surface)", color: "var(--color-on-surface)",
              outline: "none", fontSize: "0.9375rem"
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filteredTags.map((t) => (
          <div key={t.id} style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "1rem",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            transition: "transform 0.2s, box-shadow 0.2s",
            flexWrap: "wrap",
            gap: "1rem"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
          }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: "1 1 300px" }}>
              <div style={{ 
                width: "48px", height: "48px", borderRadius: "12px", 
                backgroundColor: "var(--color-surface-container)", 
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-primary)"
              }}>
                <Tag size={24} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.125rem", fontWeight: 600, color: "var(--color-on-surface)" }}>
                  {t.name}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span style={{ opacity: 0.6 }}>#</span> {t.slug}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <LayoutGrid size={14} /> {t._count?.posts || 0} posts
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <span style={{
                padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em",
                backgroundColor: t.status === "ACTIVE" ? "rgba(46, 125, 50, 0.1)" : "rgba(158, 158, 158, 0.1)",
                color: t.status === "ACTIVE" ? "#2e7d32" : "#757575",
                textTransform: "uppercase"
              }}>
                {t.status}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/admin/blog/tags/${t.id}/edit`}>
                  <button style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "50%",
                    backgroundColor: "transparent", border: "1px solid var(--color-outline-variant)",
                    color: "var(--color-on-surface)", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-variant)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  title="Edit Tag"
                  >
                    <Edit2 size={16} />
                  </button>
                </Link>
                <button 
                  onClick={() => deleteTag(t.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "50%",
                    backgroundColor: "transparent", border: "1px solid rgba(220, 38, 38, 0.3)",
                    color: "#dc2626", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  title="Delete Tag"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {tags.length === 0 && !searchQuery && (
          <div style={{ 
            textAlign: "center", padding: "4rem 2rem", 
            backgroundColor: "var(--color-surface-container-lowest)", 
            borderRadius: "1rem", border: "1px dashed var(--color-outline)",
            marginTop: "1rem"
          }}>
            <div style={{ 
              width: "64px", height: "64px", borderRadius: "50%", 
              backgroundColor: "var(--color-surface-variant)", 
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem auto", color: "var(--color-primary)"
            }}>
              <Tag size={32} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--color-on-surface)" }}>No blog tags yet</h3>
            <p style={{ color: "var(--color-on-surface-variant)", margin: "0 0 1.5rem 0", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
              Tags help readers find content across different categories. Create your first tag to get started.
            </p>
            <Link href="/admin/blog/tags/add">
              <button style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)",
                padding: "0.75rem 1.5rem", borderRadius: "9999px", border: "none",
                fontWeight: 500, fontSize: "0.9375rem", cursor: "pointer"
              }}>
                <Plus size={18} />
                <span>Create Tag</span>
              </button>
            </Link>
          </div>
        )}

        {tags.length > 0 && filteredTags.length === 0 && searchQuery && (
           <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-on-surface-variant)", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "1rem" }}>
             No tags match your search criteria.
           </div>
        )}
      </div>
    </div>
  );
}

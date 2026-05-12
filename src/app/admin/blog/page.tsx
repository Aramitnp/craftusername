"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Search, Calendar, Folder, Tag, Image as ImageIcon, LayoutGrid, Filter, ArrowDownUp } from "lucide-react";

export default function AdminBlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const fetchPosts = () => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await fetch(`/api/blog/${id}`, { method: "DELETE" });
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach(p => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return Array.from(cats);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = (post.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (post.slug || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || post.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || (post.category?.name === categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [posts, searchQuery, statusFilter, categoryFilter, sortBy]);

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>Blog Posts</h1>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Manage your blog content and articles.</p>
        </div>
        <Link href="/admin/blog/add">
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)",
            padding: "0.75rem 1.25rem", borderRadius: "9999px", border: "none",
            fontWeight: 500, fontSize: "0.9375rem", cursor: "pointer", transition: "background-color 0.2s"
          }}>
            <Plus size={18} />
            <span>Add New Post</span>
          </button>
        </Link>
      </div>

      {posts.length > 0 && (
        <div style={{ 
          display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem", 
          backgroundColor: "var(--color-surface)", padding: "1rem", 
          borderRadius: "1rem", border: "1px solid var(--color-outline-variant)"
        }}>
          <div style={{ flex: "1 1 250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-variant)" }} />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem",
                borderRadius: "0.75rem", border: "1px solid var(--color-outline-variant)",
                backgroundColor: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)",
                outline: "none", fontSize: "0.875rem"
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", flex: "1 1 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={16} color="var(--color-on-surface-variant)" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "0.625rem 2rem 0.625rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--color-outline-variant)",
                  backgroundColor: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)",
                  outline: "none", fontSize: "0.875rem", cursor: "pointer", appearance: "none"
                }}
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {uniqueCategories.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Folder size={16} color="var(--color-on-surface-variant)" />
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: "0.625rem 2rem 0.625rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--color-outline-variant)",
                    backgroundColor: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)",
                    outline: "none", fontSize: "0.875rem", cursor: "pointer", appearance: "none"
                  }}
                >
                  <option value="ALL">All Categories</option>
                  {uniqueCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowDownUp size={16} color="var(--color-on-surface-variant)" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "0.625rem 2rem 0.625rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--color-outline-variant)",
                  backgroundColor: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)",
                  outline: "none", fontSize: "0.875rem", cursor: "pointer", appearance: "none"
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredPosts.map((post) => (
          <div key={post.id} style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "1rem",
            padding: "1.25rem",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            transition: "transform 0.2s, box-shadow 0.2s",
            flexWrap: "wrap",
            gap: "1.5rem"
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
            <div style={{ display: "flex", gap: "1.5rem", flex: "1 1 300px" }}>
              {post.featuredImage ? (
                <div style={{ 
                  width: "120px", height: "80px", borderRadius: "0.75rem", overflow: "hidden", flexShrink: 0,
                  backgroundColor: "var(--color-surface-variant)", border: "1px solid var(--color-outline-variant)"
                }}>
                  <img src={post.featuredImage} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ 
                  width: "120px", height: "80px", borderRadius: "0.75rem", flexShrink: 0,
                  backgroundColor: "var(--color-surface-container)", border: "1px dashed var(--color-outline-variant)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-on-surface-variant)"
                }}>
                  <ImageIcon size={24} opacity={0.5} />
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.125rem", fontWeight: 600, color: "var(--color-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {post.title}
                </h3>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "var(--color-on-surface-variant)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span style={{ opacity: 0.6 }}>/blog/</span>{post.slug}
                </p>
                
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  {post.category && (
                    <span style={{ 
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                      padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem",
                      backgroundColor: "var(--color-surface-variant)", color: "var(--color-on-surface-variant)"
                    }}>
                      <Folder size={12} /> {post.category.name}
                    </span>
                  )}
                  {post.tags && post.tags.length > 0 && post.tags.slice(0, 2).map((t: any) => (
                    <span key={t.id} style={{ 
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                      padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem",
                      backgroundColor: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)"
                    }}>
                      <Tag size={12} /> {t.name}
                    </span>
                  ))}
                  {post.tags && post.tags.length > 2 && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)" }}>+{post.tags.length - 2} more</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", minWidth: "100px" }}>
                <span style={{
                  padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em",
                  backgroundColor: post.status === "PUBLISHED" ? "rgba(46, 125, 50, 0.1)" : "rgba(158, 158, 158, 0.1)",
                  color: post.status === "PUBLISHED" ? "#2e7d32" : "#757575",
                  textTransform: "uppercase"
                }}>
                  {post.status}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--color-on-surface-variant)" }}>
                  <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={`/admin/blog/${post.id}/edit`}>
                  <button style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "0.5rem 1rem", borderRadius: "9999px", gap: "0.5rem",
                    backgroundColor: "transparent", border: "1px solid var(--color-outline-variant)",
                    color: "var(--color-on-surface)", cursor: "pointer", transition: "all 0.2s",
                    fontSize: "0.875rem", fontWeight: 500
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface-variant)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                </Link>
                <button 
                  onClick={() => deletePost(post.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "50%",
                    backgroundColor: "transparent", border: "1px solid rgba(220, 38, 38, 0.3)",
                    color: "#dc2626", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  title="Delete Post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && !searchQuery && (
          <div style={{ 
            textAlign: "center", padding: "5rem 2rem", 
            backgroundColor: "var(--color-surface-container-lowest)", 
            borderRadius: "1rem", border: "1px dashed var(--color-outline)",
            marginTop: "1rem"
          }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "50%", 
              backgroundColor: "var(--color-surface-variant)", 
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem auto", color: "var(--color-primary)"
            }}>
              <LayoutGrid size={40} />
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "var(--color-on-surface)" }}>No blog posts yet</h3>
            <p style={{ color: "var(--color-on-surface-variant)", margin: "0 0 2rem 0", maxWidth: "450px", marginLeft: "auto", marginRight: "auto", fontSize: "1rem" }}>
              Start sharing your knowledge. Create your first blog post to engage your audience.
            </p>
            <Link href="/admin/blog/add">
              <button style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)",
                padding: "0.875rem 1.5rem", borderRadius: "9999px", border: "none",
                fontWeight: 600, fontSize: "1rem", cursor: "pointer"
              }}>
                <Plus size={20} />
                <span>Create your first post</span>
              </button>
            </Link>
          </div>
        )}

        {posts.length > 0 && filteredPosts.length === 0 && (
           <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-on-surface-variant)", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "1rem" }}>
             <p style={{ fontSize: "1.125rem", margin: "0 0 0.5rem 0" }}>No posts match your filters.</p>
             <button 
               onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setCategoryFilter("ALL"); }}
               style={{ background: "none", border: "none", color: "var(--color-primary)", textDecoration: "underline", cursor: "pointer", fontSize: "0.9375rem" }}
             >
               Clear all filters
             </button>
           </div>
        )}
      </div>
    </div>
  );
}

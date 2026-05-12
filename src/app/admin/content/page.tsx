"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminContentPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.content) {
          setMessage(data.error || "Failed to load configuration. Try restarting your development server.");
          setLoading(false);
          return;
        }
        setContent(data.content);
        
        // Fetch tags and posts for Homepage Blog Section
        Promise.all([
          fetch("/api/blog/tags").then(r => r.json()),
          fetch("/api/blog").then(r => r.json())
        ]).then(([tagsData, postsData]) => {
          if (!tagsData.error) setTags(tagsData);
          if (!postsData.error) setPosts(postsData);
        }).finally(() => {
          setLoading(false);
        });
      })
      .catch(err => {
        setMessage("Error connecting to server.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setContent({ ...content, [field]: e.target.value });
  };

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
      if (res.ok) setMessage("Content saved successfully!");
      else setMessage("Failed to save.");
    } catch (err) {
      setMessage("Error saving.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!content) return (
    <div>
      <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "2rem" }}>Content Management</h1>
      <p style={{ color: "var(--color-on-error-container)", padding: "1rem", backgroundColor: "var(--color-error-container)", borderRadius: "var(--radius-md)" }}>
        {message}
      </p>
    </div>
  );

  return (
    <div>
      <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "2rem" }}>Content Management</h1>
      
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "800px" }}>
        
        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Homepage Hero</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Display Title (Hero Heading)</label>
              <p style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)", marginBottom: "0.5rem" }}>Visible to users. If empty, falls back to SEO Title.</p>
              <Input value={content.heroTitle || ""} onChange={(e) => handleChange(e, "heroTitle")} />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Display Subtitle (Hero Subheading)</label>
              <Input value={content.heroSubtitle || ""} onChange={(e) => handleChange(e, "heroSubtitle")} />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Search Placeholder</label>
              <Input value={content.searchPlaceholder} onChange={(e) => handleChange(e, "searchPlaceholder")} required />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Search Button Text</label>
              <Input value={content.searchButton} onChange={(e) => handleChange(e, "searchButton")} required />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Supported Platforms Section</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Title</label>
              <Input value={content.supportedPlatformsTitle} onChange={(e) => handleChange(e, "supportedPlatformsTitle")} required />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Description (Supports HTML)</label>
              <textarea 
                value={content.supportedPlatformsDesc} 
                onChange={(e) => handleChange(e, "supportedPlatformsDesc")} 
                required 
                style={{ width: "100%", padding: "1rem", borderRadius: "var(--radius-md)", border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)", fontFamily: "var(--font-inter)", fontSize: "1rem", minHeight: "100px", resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>SEO / Explanatory Section</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Explanation Title</label>
              <Input value={content.explanationTitle} onChange={(e) => handleChange(e, "explanationTitle")} required />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Explanation Text</label>
              <textarea 
                value={content.explanationText} 
                onChange={(e) => handleChange(e, "explanationText")} 
                required 
                style={{ width: "100%", padding: "1rem", borderRadius: "var(--radius-md)", border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)", fontFamily: "var(--font-inter)", fontSize: "1rem", minHeight: "100px" }}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>How It Works Section</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1rem" }}>Three-step explainer shown on the homepage between supported platforms and FAQ.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Section Title</label>
              <Input value={content.howItWorksTitle || ""} onChange={(e) => handleChange(e, "howItWorksTitle")} />
            </div>
            <div style={{ backgroundColor: "var(--color-surface-container)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <span className="label-md" style={{ color: "var(--color-on-surface-variant)" }}>Step 1</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Input value={content.howItWorksStep1Title || ""} onChange={(e) => handleChange(e, "howItWorksStep1Title")} placeholder="Step title" />
                <Input value={content.howItWorksStep1Text || ""} onChange={(e) => handleChange(e, "howItWorksStep1Text")} placeholder="Step description" />
              </div>
            </div>
            <div style={{ backgroundColor: "var(--color-surface-container)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <span className="label-md" style={{ color: "var(--color-on-surface-variant)" }}>Step 2</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Input value={content.howItWorksStep2Title || ""} onChange={(e) => handleChange(e, "howItWorksStep2Title")} placeholder="Step title" />
                <Input value={content.howItWorksStep2Text || ""} onChange={(e) => handleChange(e, "howItWorksStep2Text")} placeholder="Step description" />
              </div>
            </div>
            <div style={{ backgroundColor: "var(--color-surface-container)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <span className="label-md" style={{ color: "var(--color-on-surface-variant)" }}>Step 3</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Input value={content.howItWorksStep3Title || ""} onChange={(e) => handleChange(e, "howItWorksStep3Title")} placeholder="Step title" />
                <Input value={content.howItWorksStep3Text || ""} onChange={(e) => handleChange(e, "howItWorksStep3Text")} placeholder="Step description" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Popular Platforms Section</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1rem" }}>Internal linking section on homepage listing active platform pages.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Section Title</label>
              <Input value={content.popularPlatformsTitle || ""} onChange={(e) => handleChange(e, "popularPlatformsTitle")} />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Section Description</label>
              <Input value={content.popularPlatformsDesc || ""} onChange={(e) => handleChange(e, "popularPlatformsDesc")} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Homepage Blog Section</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Showcase latest username ideas and guides on the homepage.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Section Title</label>
              <Input value={content.homepageBlogTitle || "Latest Username Ideas & Guides"} onChange={(e) => handleChange(e, "homepageBlogTitle")} />
            </div>
            <div>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Section Subtitle</label>
              <Input value={content.homepageBlogSubtitle || "Explore tips, username ideas, and branding guides for social media platforms."} onChange={(e) => handleChange(e, "homepageBlogSubtitle")} />
            </div>
            
            <div style={{ borderTop: "1px solid var(--color-outline-variant)", paddingTop: "1.5rem" }}>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>A. Auto-fetch via Featured Tag</label>
              <p style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)", marginBottom: "0.5rem" }}>Select a tag to automatically show the latest 3 published posts with this tag.</p>
              <select
                value={content.featuredBlogTagId || ""}
                onChange={(e) => setContent({ ...content, featuredBlogTagId: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", backgroundColor: "var(--color-surface)", fontSize: "0.9375rem" }}
              >
                <option value="">-- No Tag Selected --</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>

            <div style={{ borderTop: "1px solid var(--color-outline-variant)", paddingTop: "1.5rem" }}>
              <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>B. Manual Override (Select Specific Posts)</label>
              <p style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)", marginBottom: "0.5rem" }}>If any posts are selected here, they will override the tag auto-fetch above. Max 3.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "250px", overflowY: "auto", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)", padding: "0.5rem", backgroundColor: "var(--color-surface)" }}>
                {posts.map(post => {
                  const isSelected = (content.featuredBlogPosts || []).includes(post.id);
                  return (
                    <label key={post.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", cursor: "pointer", backgroundColor: isSelected ? "var(--color-surface-container-highest)" : "transparent", borderRadius: "var(--radius-sm)" }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => {
                          let newPosts = [...(content.featuredBlogPosts || [])];
                          if (e.target.checked) {
                            if (newPosts.length < 3) newPosts.push(post.id);
                            else alert("You can only select up to 3 manual posts.");
                          } else {
                            newPosts = newPosts.filter(id => id !== post.id);
                          }
                          setContent({ ...content, featuredBlogPosts: newPosts });
                        }}
                      />
                      <span style={{ fontSize: "0.875rem", fontWeight: isSelected ? 600 : 400 }}>{post.title}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)", marginLeft: "auto" }}>{post.status}</span>
                    </label>
                  );
                })}
                {posts.length === 0 && <span style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", padding: "0.5rem" }}>No blog posts found.</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", margin: 0 }}>FAQ Section</h2>
            <Button type="button" onClick={() => {
              const updatedFaq = [...(content.faq || []), { question: "", answer: "" }];
              setContent({ ...content, faq: updatedFaq });
            }} style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>+ Add Question</Button>
          </div>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Manage the Frequently Asked Questions shown on the homepage. Changes are saved when you click "Save Content" below.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {(content.faq || []).map((faq: any, index: number) => (
              <div key={index} style={{ backgroundColor: "var(--color-surface-container)", padding: "1.25rem", borderRadius: "var(--radius-md)", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span className="label-md" style={{ color: "var(--color-on-surface-variant)" }}>FAQ #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedFaq = content.faq.filter((_: any, i: number) => i !== index);
                      setContent({ ...content, faq: updatedFaq });
                    }}
                    style={{
                      background: "none", border: "none", color: "var(--color-error, #d32f2f)", cursor: "pointer",
                      fontSize: "0.875rem", fontWeight: 600, padding: "0.25rem 0.5rem"
                    }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Question</label>
                    <Input
                      value={faq.question}
                      onChange={(e) => {
                        const updatedFaq = [...content.faq];
                        updatedFaq[index] = { ...updatedFaq[index], question: e.target.value };
                        setContent({ ...content, faq: updatedFaq });
                      }}
                      placeholder="e.g. Is this tool free?"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-md" style={{ display: "block", marginBottom: "0.5rem" }}>Answer</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const updatedFaq = [...content.faq];
                        updatedFaq[index] = { ...updatedFaq[index], answer: e.target.value };
                        setContent({ ...content, faq: updatedFaq });
                      }}
                      placeholder="Write the answer here..."
                      required
                      style={{
                        width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)",
                        border: "2px solid transparent", backgroundColor: "var(--color-surface-container-highest)",
                        fontFamily: "var(--font-inter)", fontSize: "0.9375rem", minHeight: "80px", resize: "vertical"
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!content.faq || content.faq.length === 0) && (
              <p style={{ color: "var(--color-on-surface-variant)", textAlign: "center", padding: "2rem 0" }}>
                No FAQ items yet. Click "+ Add Question" above to create one.
              </p>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", padding: "1.5rem", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "1.125rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Footer Settings</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Manage your site-wide footer including brand information, columns, and internal links.
          </p>
          <a href="/admin/content/footer" style={{ display: "inline-block", textDecoration: "none" }}>
            <Button type="button" style={{ width: "auto" }}>Manage Footer Settings</Button>
          </a>
        </div>

        {message && <div style={{ padding: "1rem", backgroundColor: "var(--color-surface-container)", borderRadius: "var(--radius-md)", color: "var(--color-primary)", fontWeight: 600 }}>{message}</div>}

        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Content"}</Button>
      </form>
    </div>
  );
}

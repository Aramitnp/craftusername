"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) setMedia(data);
    } catch {
      setMessage("Failed to load media.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (res.ok) {
        setMessage("Image uploaded successfully!");
        fetchMedia();
      } else {
        const err = await res.json();
        setMessage(err.error || "Upload failed.");
      }
    } catch {
      setMessage("Upload error.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image permanently?")) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia(media.filter(m => m.id !== id));
        setMessage("Deleted.");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch {
      setMessage("Delete failed.");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setMessage("URL copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  if (loading) return <p>Loading media...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.25rem" }}>Media Library</h1>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Upload and manage images for platform logos and content.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: "none" }}
            id="media-upload"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </div>

      {message && (
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "var(--color-surface-container)", borderRadius: "var(--radius-md)", color: "var(--color-primary)", fontWeight: 600, marginBottom: "1.5rem" }}>
          {message}
        </div>
      )}

      {media.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "1.125rem" }}>No images uploaded yet.</p>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem" }}>Click "Upload Image" to add your first image.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {media.map(item => (
            <div key={item.id} style={{ backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ width: "100%", height: "160px", backgroundColor: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img
                  src={item.url}
                  alt={item.publicId}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.publicId.split("/").pop()}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => copyUrl(item.url)}
                    style={{
                      flex: 1, padding: "0.4rem", fontSize: "0.75rem", fontWeight: 600,
                      backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)",
                      border: "none", borderRadius: "var(--radius-md)", cursor: "pointer"
                    }}
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: "0.4rem 0.6rem", fontSize: "0.75rem", fontWeight: 600,
                      backgroundColor: "transparent", color: "var(--color-error, #d32f2f)",
                      border: "1px solid var(--color-error, #d32f2f)", borderRadius: "var(--radius-md)", cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

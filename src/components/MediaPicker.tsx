"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
}

interface MediaPickerProps {
  currentUrl: string;
  onSelect: (url: string) => void;
}

export default function MediaPicker({ currentUrl, onSelect }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const openPicker = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) setMedia(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    onSelect(url);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
        {currentUrl && (
          <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src={currentUrl} alt="Current logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        )}
        <Button type="button" variant="secondary" onClick={openPicker} style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
          Choose from Media
        </Button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "0.75rem", backgroundColor: "var(--color-surface-container)", padding: "1rem", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span className="label-md" style={{ color: "var(--color-on-surface-variant)" }}>Select an image from your Media Library</span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer", fontSize: "1.25rem", padding: "0.25rem" }}
        >
          ✕
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-on-surface-variant)", textAlign: "center", padding: "1rem" }}>Loading...</p>
      ) : media.length === 0 ? (
        <p style={{ color: "var(--color-on-surface-variant)", textAlign: "center", padding: "1rem" }}>
          No images found. Upload images in the <strong>Media</strong> section first.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", maxHeight: "300px", overflowY: "auto" }}>
          {media.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.url)}
              style={{
                width: "100%", height: "100px", padding: "0.5rem",
                backgroundColor: item.url === currentUrl ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                border: item.url === currentUrl ? "2px solid var(--color-primary)" : "2px solid transparent",
                borderRadius: "var(--radius-md)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
              }}
            >
              <img src={item.url} alt={item.publicId} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

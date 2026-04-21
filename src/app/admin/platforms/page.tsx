"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { config } from "@/config/content";

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = () => {
    fetch("/api/platforms")
      .then((res) => res.json())
      .then((data) => setPlatforms(data))
      .catch(console.error);
  };

  const deletePlatform = async (id: string) => {
    if (!confirm("Are you sure you want to delete this platform?")) return;
    try {
      await fetch(`/api/platforms/${id}`, { method: "DELETE" });
      fetchPlatforms();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/platforms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchPlatforms();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "0.5rem" }}>{config.admin.title}</h1>
          <p style={{ color: "var(--color-on-surface-variant)" }}>Manage the platforms available in the username checker.</p>
        </div>
        <Link href="/admin/platforms/add">
          <Button>{config.admin.addPlatform}</Button>
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {platforms.map((platform) => (
          <Card key={platform.id} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 48, height: 48, backgroundColor: "var(--color-surface-container)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {platform.logo ? <img src={platform.logo} alt={platform.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontWeight: "bold" }}>{platform.name[0]}</span>}
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1.125rem", display: "block", color: "var(--color-primary)" }}>{platform.name}</span>
                  <span className="label-md" style={{ color: "var(--color-on-surface-variant)", textTransform: "none" }}>Slug: {platform.slug} • Order: {platform.sortOrder}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Badge status={platform.isActive ? "Available" : "Taken"} onClick={() => toggleActive(platform.id, platform.isActive)} style={{ cursor: "pointer", marginRight: "1rem" }} title="Click to toggle status" />
                <Link href={`/admin/platforms/${platform.id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <Button variant="ghost" onClick={() => deletePlatform(platform.id)}>Delete</Button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "var(--color-surface)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <div>
                <span className="label-md" style={{ display: "block", color: "var(--color-on-surface-variant)", marginBottom: "0.25rem" }}>URL Pattern</span>
                <span style={{ fontSize: "0.875rem", fontFamily: "monospace" }}>{platform.profileUrlPattern}</span>
              </div>
              <div>
                <span className="label-md" style={{ display: "block", color: "var(--color-on-surface-variant)", marginBottom: "0.25rem" }}>Check Strategy</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>HTTP {platform.checkMethod}</span>
              </div>
            </div>
          </Card>
        ))}
        {platforms.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "1rem" }}>No platforms found.</p>
            <Link href="/admin/platforms/add">
              <Button>Add your first platform</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

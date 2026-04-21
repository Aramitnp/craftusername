"use client";

import { useEffect, useState, use } from "react";
import PlatformForm from "@/components/PlatformForm";

export default function EditPlatformPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/platforms`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === id);
        setPlatform(found);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!platform) return <p>Platform not found</p>;

  return (
    <div>
      <h1 className="headline-md" style={{ paddingTop: 0, marginBottom: "2rem" }}>Edit Platform</h1>
      <PlatformForm initialData={platform} isEdit={true} />
    </div>
  );
}

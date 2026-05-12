"use client";

import { useState, useEffect } from "react";
import TagForm from "@/components/TagForm";
import { useParams } from "next/navigation";

export default function EditTagPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/blog/tags/${id}`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Tag</h2>
      <TagForm initialData={data} />
    </div>
  );
}

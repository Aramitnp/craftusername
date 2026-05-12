"use client";

import { useState, useEffect } from "react";
import CategoryForm from "@/components/CategoryForm";
import { useParams } from "next/navigation";

export default function EditCategoryPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/blog/categories/${id}`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Category</h2>
      <CategoryForm initialData={data} />
    </div>
  );
}

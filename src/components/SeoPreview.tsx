export default function SeoPreview({
  title,
  description,
  slug,
  baseUrl = "https://craftusername.com",
}: {
  title: string;
  description: string;
  slug: string;
  baseUrl?: string;
}) {
  const finalUrl = `${baseUrl}/${slug.replace(/^\//, '')}`;
  const displayTitle = title || "SEO Title Preview";
  const displayDesc = description || "This is how your meta description will look in Google search results. Make sure it is compelling and within the recommended length to encourage clicks.";

  const titleLength = title.length;
  const descLength = description.length;

  return (
    <div style={{ backgroundColor: "var(--color-surface)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)", marginTop: "1rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Google Search Preview</h3>
      
      <div style={{ maxWidth: "600px", fontFamily: "arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <div style={{ width: "28px", height: "28px", backgroundColor: "#f1f3f4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>C</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", color: "#202124" }}>CraftUsername</span>
            <span style={{ fontSize: "12px", color: "#4d5156" }}>{finalUrl}</span>
          </div>
        </div>
        <div style={{ fontSize: "20px", color: "#1a0dab", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {displayTitle}
        </div>
        <div style={{ fontSize: "14px", color: "#4d5156", lineHeight: "1.58", wordWrap: "break-word" }}>
          {displayDesc}
        </div>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "2rem", fontSize: "0.875rem" }}>
        <div>
          <span style={{ color: titleLength > 60 ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
            Title: {titleLength} chars (Recommended: 50-60)
          </span>
        </div>
        <div>
          <span style={{ color: descLength > 160 ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
            Description: {descLength} chars (Recommended: 140-160)
          </span>
        </div>
      </div>
    </div>
  );
}

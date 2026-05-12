"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  // Basic media picker state
  const [media, setMedia] = useState<{url: string, id: string}[]>([]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3], // SEO rules: start from H2/H3
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'content-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'content-link',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const loadMedia = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) setMedia(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenMedia = () => {
    setShowMediaPicker(true);
    loadMedia();
  };

  const insertImage = (url: string) => {
    const alt = window.prompt("Enter image alt text (required for SEO):", "");
    if (alt !== null) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
    setShowMediaPicker(false);
  };

  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    
    // Simple prompt for link, in a real app this could be a modal to search internal links
    const url = window.prompt('URL');
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div style={{ border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", padding: "0.5rem", backgroundColor: "var(--color-surface-container-lowest)", borderBottom: "1px solid var(--color-outline)" }}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{ backgroundColor: editor.isActive('heading', { level: 2 }) ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem" }}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{ backgroundColor: editor.isActive('heading', { level: 3 }) ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem" }}
        >
          H3
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().setParagraph().run()}
          style={{ backgroundColor: editor.isActive('paragraph') ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem" }}
        >
          P
        </Button>
        <div style={{ width: "1px", backgroundColor: "var(--color-outline)", margin: "0 0.25rem" }}></div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ backgroundColor: editor.isActive('bold') ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem", fontWeight: "bold" }}
        >
          B
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ backgroundColor: editor.isActive('italic') ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem", fontStyle: "italic" }}
        >
          I
        </Button>
        <div style={{ width: "1px", backgroundColor: "var(--color-outline)", margin: "0 0.25rem" }}></div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{ backgroundColor: editor.isActive('bulletList') ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem" }}
        >
          • List
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{ backgroundColor: editor.isActive('orderedList') ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem" }}
        >
          1. List
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{ backgroundColor: editor.isActive('blockquote') ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem" }}
        >
          Quote
        </Button>
        <div style={{ width: "1px", backgroundColor: "var(--color-outline)", margin: "0 0.25rem" }}></div>
        <Button
          type="button"
          variant="ghost"
          onClick={toggleLink}
          style={{ backgroundColor: editor.isActive('link') ? "var(--color-primary-container)" : "transparent", padding: "0.25rem 0.5rem" }}
        >
          Link
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleOpenMedia}
          style={{ padding: "0.25rem 0.5rem" }}
        >
          Image
        </Button>
        <div style={{ width: "1px", backgroundColor: "var(--color-outline)", margin: "0 0.25rem", flexGrow: 1 }}></div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          style={{ padding: "0.25rem 0.5rem" }}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          style={{ padding: "0.25rem 0.5rem" }}
        >
          Redo
        </Button>
      </div>

      {showMediaPicker && (
        <div style={{ padding: "1rem", backgroundColor: "var(--color-surface-container)", borderBottom: "1px solid var(--color-outline)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>Select Image to Insert</span>
            <button type="button" onClick={() => setShowMediaPicker(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
          </div>
          {media.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>No media found. Upload in the Media section first.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => insertImage(m.url)}
                  style={{
                    height: "80px", padding: "0.25rem", border: "1px solid var(--color-outline)",
                    backgroundColor: "white", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  }}
                >
                  <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "1rem", minHeight: "300px", cursor: "text", backgroundColor: "var(--color-surface)" }} onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} style={{ outline: "none", minHeight: "300px" }} />
      </div>
      
      <style>{`
        .tiptap {
          outline: none;
        }
        .tiptap p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .tiptap h2 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .tiptap h3 {
          font-size: 1.25rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .tiptap img.content-image {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-md);
          margin: 1rem 0;
        }
        .tiptap a.content-link {
          color: var(--color-primary);
          text-decoration: underline;
        }
        .tiptap blockquote {
          border-left: 4px solid var(--color-outline);
          padding-left: 1rem;
          margin-left: 0;
          color: var(--color-on-surface-variant);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

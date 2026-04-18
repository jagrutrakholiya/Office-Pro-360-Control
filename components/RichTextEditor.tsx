"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaLink,
  FaUnlink,
  FaImage,
  FaUndo,
  FaRedo,
} from "react-icons/fa";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const btn = (active: boolean) =>
    `p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
      active ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
    }`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
        title="Bold"
      >
        <FaBold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
        title="Italic"
      >
        <FaItalic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive("strike"))}
        title="Strike"
      >
        <FaStrikethrough className="w-3.5 h-3.5" />
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        <span className="text-xs font-bold">H2</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
      >
        <span className="text-xs font-bold">H3</span>
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <FaListUl className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
        title="Ordered List"
      >
        <FaListOl className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
        title="Blockquote"
      >
        <FaQuoteLeft className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btn(editor.isActive("codeBlock"))}
        title="Code Block"
      >
        <FaCode className="w-3.5 h-3.5" />
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={setLink}
        className={btn(editor.isActive("link"))}
        title="Add Link"
      >
        <FaLink className="w-3.5 h-3.5" />
      </button>
      {editor.isActive("link") && (
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={btn(false)}
          title="Remove Link"
        >
          <FaUnlink className="w-3.5 h-3.5" />
        </button>
      )}
      <button type="button" onClick={addImage} className={btn(false)} title="Insert Image">
        <FaImage className="w-3.5 h-3.5" />
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${btn(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
        title="Undo"
      >
        <FaUndo className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${btn(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
        title="Redo"
      >
        <FaRedo className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 240 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Image,
      Placeholder.configure({ placeholder: placeholder || "Write your content..." }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  return (
    <div
      className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-hidden"
      style={{ minHeight: minHeight + 50 }}
    >
      <Toolbar editor={editor} />
      <div style={{ minHeight }} className="overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

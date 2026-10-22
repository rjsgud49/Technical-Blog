"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useState } from "react";
import { plainTextToHtml } from "@/lib/admin/html-body";
import { fileToArticleSrc } from "@/lib/admin/article-image";
import {
  Callout,
  type CalloutVariant,
} from "@/components/writer/extensions/Callout";
import { CodeBlockWithLanguage } from "@/components/writer/extensions/CodeBlockWithLanguage";
import { ResizableImage } from "@/components/writer/extensions/ResizableImage";

/** 인용은 문단만 — 콜아웃과 중첩되어 회색 바가 생기는 것 방지 */
const EditorBlockquote = Blockquote.extend({
  content: "paragraph+",
}).configure({
  HTMLAttributes: {
    class: "editor-blockquote",
  },
});

interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClass?: string;
}

function toEditorHtml(value: string) {
  const html = plainTextToHtml(value);
  return html.trim() ? html : "<p></p>";
}

function collectImageFiles(list: FileList | File[] | null | undefined) {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "본문을 작성하세요… 툴바로 제목·코드·색상 박스·사진을 넣으면 여기서 바로 보입니다.",
  className = "",
  minHeightClass = "min-h-72",
}: WysiwygEditorProps) {
  /** 에디터가 방금 내보낸 HTML — 외부 value와 같으면 setContent 하지 않음 */
  const lastEmittedRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertImagesRef = useRef<(files: File[]) => Promise<void>>(
    async () => undefined,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, setEditorTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        codeBlock: false,
        link: false,
        underline: false,
      }),
      CodeBlockWithLanguage,
      EditorBlockquote,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary-600 underline" },
      }),
      Callout,
      ResizableImage,
      Placeholder.configure({ placeholder }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        class: `prose-editor prose-content outline-none px-4 py-4 ${minHeightClass}`,
      },
      handlePaste(_view, event) {
        const files = collectImageFiles(event.clipboardData?.files);
        if (!files.length) return false;
        event.preventDefault();
        void insertImagesRef.current(files);
        return true;
      },
      handleDrop(_view, event) {
        const files = collectImageFiles(event.dataTransfer?.files);
        if (!files.length) return false;
        event.preventDefault();
        void insertImagesRef.current(files);
        return true;
      },
    },
    onCreate: ({ editor: ed }) => {
      lastEmittedRef.current = ed.getHTML();
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedRef.current = html;
      onChange(html);
    },
  });

  insertImagesRef.current = async (files: File[]) => {
    if (!editor || !files.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of files) {
        const src = await fileToArticleSrc(file);
        const alt = file.name.replace(/\.[^.]+$/, "");
        editor.chain().focus().setImage({ src, alt }).run();
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!editor) return;
    const next = toEditorHtml(value);
    if (next === lastEmittedRef.current) return;
    if (next === editor.getHTML()) {
      lastEmittedRef.current = next;
      return;
    }
    lastEmittedRef.current = next;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const bump = () => setEditorTick((n) => n + 1);
    editor.on("selectionUpdate", bump);
    editor.on("transaction", bump);
    return () => {
      editor.off("selectionUpdate", bump);
      editor.off("transaction", bump);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div
        className={`rounded-lg border border-neutral-200 bg-neutral-50 ${minHeightClass} ${className}`}
      />
    );
  }

  function toggleBlockquote() {
    if (editor!.isActive("callout")) {
      editor!.chain().focus().unsetCallout().toggleBlockquote().run();
      return;
    }
    editor!.chain().focus().toggleBlockquote().run();
  }

  /** 드래그한 구간만 코드박스로 — 선택 없으면 현재 블록 토글 */
  function applyCodeBox() {
    const ed = editor!;
    const { state } = ed;
    const { from, to, empty } = state.selection;
    const language = "typescript";

    if (empty) {
      ed.chain().focus().toggleCodeBlock({ language }).run();
      return;
    }

    const selectedText = state.doc.textBetween(from, to, "\n");

    // 코드박스 안 일부 선택: 앞·뒤는 문단, 드래그한 부분만 코드박스
    const $from = state.selection.$from;
    const $to = state.selection.$to;
    let codeDepth = $from.depth;
    while (codeDepth > 0 && $from.node(codeDepth).type.name !== "codeBlock") {
      codeDepth -= 1;
    }
    const sameCodeBlock =
      codeDepth > 0 &&
      $to.depth >= codeDepth &&
      $to.node(codeDepth).type.name === "codeBlock" &&
      $from.before(codeDepth) === $to.before(codeDepth);

    if (sameCodeBlock) {
      const blockStart = $from.before(codeDepth);
      const blockEnd = $from.after(codeDepth);
      const contentStart = $from.start(codeDepth);
      const blockText = $from.node(codeDepth).textContent;
      const localFrom = Math.max(0, from - contentStart);
      const localTo = Math.min(blockText.length, to - contentStart);
      const before = blockText.slice(0, localFrom);
      const mid = blockText.slice(localFrom, localTo);
      const after = blockText.slice(localTo);

      if (!before && !after) {
        ed.chain().focus().toggleCodeBlock().run();
        return;
      }

      const toParagraphs = (text: string) =>
        text.split("\n").map((line) => ({
          type: "paragraph" as const,
          content: line ? [{ type: "text" as const, text: line }] : undefined,
        }));

      const splitNodes = [
        ...(before ? toParagraphs(before) : []),
        {
          type: "codeBlock" as const,
          attrs: { language },
          content: mid ? [{ type: "text" as const, text: mid }] : undefined,
        },
        ...(after ? toParagraphs(after) : []),
      ];

      ed.chain()
        .focus()
        .deleteRange({ from: blockStart, to: blockEnd })
        .insertContentAt(blockStart, splitNodes)
        .run();
      return;
    }

    ed.chain()
      .focus()
      .deleteSelection()
      .insertContent({
        type: "codeBlock",
        attrs: { language },
        content: selectedText
          ? [{ type: "text", text: selectedText }]
          : undefined,
      })
      .run();
  }

  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 ${className}`}
    >
      <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-neutral-200 bg-neutral-50/95 px-2 py-1.5 shadow-xs backdrop-blur-sm supports-[backdrop-filter]:bg-neutral-50/90">
        <ToolbarBtn
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarBtn
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <Sep />
        <ToolbarBtn
          label="B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="font-bold"
        />
        <ToolbarBtn
          label="I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="italic"
        />
        <ToolbarBtn
          label="U"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="underline"
        />
        <Sep />
        <ToolbarBtn
          label="목록"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarBtn
          label="번호"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarBtn
          label="인용"
          active={editor.isActive("blockquote")}
          onClick={toggleBlockquote}
        />
        <ToolbarBtn
          label="코드박스"
          active={editor.isActive("codeBlock")}
          onClick={applyCodeBox}
        />
        <Sep />
        <CalloutBtn
          label="참고"
          variant="info"
          active={editor.isActive("callout", { variant: "info" })}
          onClick={() => editor.chain().focus().toggleCallout("info").run()}
        />
        <CalloutBtn
          label="팁"
          variant="tip"
          active={editor.isActive("callout", { variant: "tip" })}
          onClick={() => editor.chain().focus().toggleCallout("tip").run()}
        />
        <CalloutBtn
          label="주의"
          variant="warn"
          active={editor.isActive("callout", { variant: "warn" })}
          onClick={() => editor.chain().focus().toggleCallout("warn").run()}
        />
        <Sep />
        <ToolbarBtn
          label="링크"
          active={editor.isActive("link")}
          onClick={() => {
            const prev = editor.getAttributes("link").href as
              | string
              | undefined;
            const url = window.prompt("링크 URL", prev ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
        />
        <ToolbarBtn
          label={uploading ? "올리는 중…" : "사진"}
          active={editor.isActive("image")}
          onClick={() => fileInputRef.current?.click()}
        />
        {editor.isActive("image") && (
          <>
            <Sep />
            <ToolbarBtn
              label="작게"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { width: 240 })
                  .run()
              }
            />
            <ToolbarBtn
              label="중간"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { width: 400 })
                  .run()
              }
            />
            <ToolbarBtn
              label="크게"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { width: 640 })
                  .run()
              }
            />
            <ToolbarBtn
              label="원본"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", { width: null })
                  .run()
              }
            />
          </>
        )}
        <ToolbarBtn
          label="⸻"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          const files = collectImageFiles(e.target.files);
          e.target.value = "";
          if (files.length) void insertImagesRef.current(files);
        }}
      />
      {uploadError && (
        <p className="border-b border-error-100 bg-error-50 px-3 py-1.5 text-xs text-error-600">
          {uploadError}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  active,
  className = "",
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs font-medium transition ${
        active
          ? "bg-primary-100 text-primary-700"
          : "text-neutral-600 hover:bg-neutral-200/70"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function CalloutBtn({
  label,
  variant,
  active,
  onClick,
}: {
  label: string;
  variant: CalloutVariant;
  active?: boolean;
  onClick: () => void;
}) {
  const tone =
    variant === "info"
      ? active
        ? "bg-primary-100 text-primary-800"
        : "text-primary-700 hover:bg-primary-50"
      : variant === "tip"
        ? active
          ? "bg-success-100 text-success-700"
          : "text-success-700 hover:bg-success-50"
        : active
          ? "bg-warning-100 text-warning-700"
          : "text-warning-700 hover:bg-warning-50";

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs font-medium transition ${tone}`}
    >
      {label}
    </button>
  );
}

function Sep() {
  return (
    <span className="mx-0.5 w-px self-stretch bg-neutral-200" aria-hidden />
  );
}

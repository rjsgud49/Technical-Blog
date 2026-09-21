import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageView } from "@/components/writer/ResizableImageView";

function parsePx(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseWidth(element: HTMLElement): number | null {
  const fromData = parsePx(
    element.getAttribute("data-width") || element.getAttribute("width"),
  );
  if (fromData) return fromData;
  const style = element.getAttribute("style") || element.style.width;
  const m = String(style).match(/(?:^|;)\s*width:\s*(\d+)px/i);
  return m ? parsePx(m[1]) : null;
}

/** 모서리 드래그로 너비를 조절하고, 저장 HTML에 width를 남긴다. */
export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => parseWidth(element),
        renderHTML: (attributes) => {
          const w = Number(attributes.width);
          if (!Number.isFinite(w) || w <= 0) return {};
          return {
            width: String(Math.round(w)),
            "data-width": String(Math.round(w)),
            style: `width: ${Math.round(w)}px; height: auto; max-width: 100%;`,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
}).configure({
  inline: false,
  allowBase64: true,
  HTMLAttributes: { class: "article-image" },
});

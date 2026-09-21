import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { mergeAttributes } from "@tiptap/core";
import { codeLanguageLabel } from "@/lib/admin/code-languages";
import { lowlight } from "@/lib/admin/lowlight";
import { CodeBlockView } from "@/components/writer/CodeBlockView";

function readLanguage(
  element: HTMLElement,
  languageClassPrefix: string | null | undefined,
): string | null {
  const fromData =
    element.getAttribute("data-language") ||
    element.querySelector("pre")?.getAttribute("data-language");
  if (fromData) return fromData;

  if (!languageClassPrefix) return null;
  const codeEl =
    element.tagName === "CODE"
      ? element
      : element.querySelector("code") || element.firstElementChild;
  const classNames = [...(codeEl?.classList || [])];
  const languages = classNames
    .filter((className) => className.startsWith(languageClassPrefix))
    .map((className) => className.replace(languageClassPrefix, ""));
  return languages[0] || null;
}

function readTitle(element: HTMLElement): string | null {
  const fromData =
    element.getAttribute("data-title") ||
    element.querySelector("pre")?.getAttribute("data-title");
  if (fromData?.trim()) return fromData.trim();
  const caption = element.querySelector("figcaption")?.textContent?.trim();
  return caption || null;
}

/** lowlight 구문 강조 + 제목 헤더 + 언어 선택 NodeView */
export const CodeBlockWithLanguage = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) =>
          readLanguage(element, this.options.languageClassPrefix),
        rendered: false,
      },
      title: {
        default: null,
        parseHTML: (element) => readTitle(element),
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.code-block-figure",
        preserveWhitespace: "full" as const,
        contentElement: (node) => {
          if (!(node instanceof HTMLElement)) return node;
          return node.querySelector("code") ?? node;
        },
      },
      {
        tag: "pre",
        preserveWhitespace: "full" as const,
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false;
          if (node.closest("figure.code-block-figure")) return false;
          return {};
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const language = (node.attrs.language as string | null) || null;
    const title = ((node.attrs.title as string | null) || "").trim() || null;
    const label = codeLanguageLabel(language);

    const pre = [
      "pre",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "code-fence",
        ...(language
          ? { "data-language": language, "data-lang-label": label }
          : {}),
        ...(title ? { "data-title": title } : {}),
      }),
      [
        "code",
        {
          class: language
            ? this.options.languageClassPrefix + language
            : null,
        },
        0,
      ],
    ] as const;

    if (!title) return pre;

    return [
      "figure",
      {
        class: "code-block-figure",
        "data-title": title,
        ...(language ? { "data-language": language } : {}),
      },
      ["figcaption", { class: "code-block-caption" }, title],
      pre,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
}).configure({
  lowlight,
  defaultLanguage: "typescript",
});

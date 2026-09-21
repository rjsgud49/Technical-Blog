import type { ContentBlock, InlineNode, Lesson } from "@/types/lesson";
import { codeLanguageLabel } from "@/lib/admin/code-languages";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === "text") return escapeHtml(n.value);
      if (n.type === "code") {
        return `<code>${escapeHtml(n.value)}</code>`;
      }
      if (n.type === "term") {
        return `<strong>${escapeHtml(n.label ?? n.slug)}</strong>`;
      }
      return "";
    })
    .join("");
}

function blockToHtml(block: ContentBlock): string {
  switch (block.type) {
    case "heading":
      return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${inlineToHtml(block.children)}</p>`;
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      const items = block.items
        .map((item) => `<li>${inlineToHtml(item)}</li>`)
        .join("");
      return `<${tag}>${items}</${tag}>`;
    }
    case "code": {
      const lang = block.language
        ? escapeHtml(block.language)
        : "";
      const label = lang
        ? escapeHtml(codeLanguageLabel(block.language) || block.language)
        : "";
      const title = block.title?.trim()
        ? escapeHtml(block.title.trim())
        : "";
      const pre = `<pre class="code-fence"${lang ? ` data-language="${lang}" data-lang-label="${label}"` : ""}${title ? ` data-title="${title}"` : ""}><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(block.code)}</code></pre>`;
      if (!title) return pre;
      return `<figure class="code-block-figure" data-title="${title}"${lang ? ` data-language="${lang}"` : ""}><figcaption class="code-block-caption">${title}</figcaption>${pre}</figure>`;
    }
    case "callout": {
      const variant = block.variant ?? "info";
      const label =
        block.title ??
        (variant === "tip" ? "팁" : variant === "warn" ? "주의" : "참고");
      return `<aside data-callout data-variant="${variant}" class="callout callout-${variant}" data-label="${escapeHtml(label)}"><p>${inlineToHtml(block.children)}</p></aside>`;
    }    default:
      return "";
  }
}

/** 시드 Lesson → WYSIWYG용 HTML */
export function lessonToBody(lesson: Lesson): string {
  const parts: string[] = [];
  for (const section of lesson.sections) {
    parts.push(`<h2>${escapeHtml(section.title)}</h2>`);
    for (const block of section.blocks) {
      const html = blockToHtml(block).trim();
      if (html) parts.push(html);
    }
  }
  return parts.join("") || "<p></p>";
}

/** 시드 섹션 하나 → WYSIWYG용 HTML */
export function sectionToBody(section: {
  title: string;
  blocks: ContentBlock[];
}): string {
  const parts: string[] = [];
  for (const block of section.blocks) {
    const html = blockToHtml(block).trim();
    if (html) parts.push(html);
  }
  return parts.join("") || "<p></p>";
}

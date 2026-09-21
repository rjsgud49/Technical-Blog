import type { ContentBlock, InlineNode } from "@/types/lesson";

export function text(value: string): InlineNode {
  return { type: "text", value };
}

export function term(slug: string, label?: string): InlineNode {
  return { type: "term", slug, label };
}

export function inlineCode(value: string): InlineNode {
  return { type: "code", value };
}

export function inline(
  ...parts: Array<string | InlineNode>
): InlineNode[] {
  return parts.map((part) => (typeof part === "string" ? text(part) : part));
}

export function p(...parts: Array<string | InlineNode>): ContentBlock {
  return { type: "paragraph", children: inline(...parts) };
}

export function h2(text: string, id?: string): ContentBlock {
  return { type: "heading", level: 2, text, id };
}

export function h3(text: string, id?: string): ContentBlock {
  return { type: "heading", level: 3, text, id };
}

export function ul(
  ...items: Array<Array<string | InlineNode> | string>
): ContentBlock {
  return {
    type: "list",
    ordered: false,
    items: items.map((item) =>
      typeof item === "string" ? [text(item)] : inline(...item),
    ),
  };
}

export function ol(
  ...items: Array<Array<string | InlineNode> | string>
): ContentBlock {
  return {
    type: "list",
    ordered: true,
    items: items.map((item) =>
      typeof item === "string" ? [text(item)] : inline(...item),
    ),
  };
}

export function code(
  code: string,
  language = "tsx",
  title?: string,
): ContentBlock {
  return { type: "code", language, code: code.trim(), title };
}

export function callout(
  variant: "info" | "tip" | "warn",
  ...parts: Array<string | InlineNode>
): ContentBlock {
  return { type: "callout", variant, children: inline(...parts) };
}

export function tip(...parts: Array<string | InlineNode>): ContentBlock {
  return callout("tip", ...parts);
}

export function warn(...parts: Array<string | InlineNode>): ContentBlock {
  return callout("warn", ...parts);
}

export function info(...parts: Array<string | InlineNode>): ContentBlock {
  return callout("info", ...parts);
}

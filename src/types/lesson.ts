/** 인라인 노드 — DB/API로 옮겨도 같은 JSON 형태 유지 */
export type InlineNode =
  | { type: "text"; value: string }
  | { type: "term"; slug: string; label?: string }
  | { type: "code"; value: string };

export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "list"; ordered?: boolean; items: InlineNode[][] }
  | { type: "code"; language: string; code: string; title?: string }
  | {
      type: "callout";
      variant: "info" | "tip" | "warn";
      title?: string;
      children: InlineNode[];
    };

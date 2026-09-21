import type { Difficulty, TopicCategory } from "@/types/content";

// 내장 + 커스텀 카테고리 모두 허용 (DB 도입 시 string PK)
export type { TopicCategory };

export const BUILTIN_CATEGORIES = [
  "history",
  "structure",
  "hooks",
  "patterns",
  "glossary",
] as const;

export type BuiltinCategory = (typeof BUILTIN_CATEGORIES)[number];

export function isBuiltinCategory(
  slug: string,
): slug is BuiltinCategory {
  return (BUILTIN_CATEGORIES as readonly string[]).includes(slug);
}

/** UI 표시 순서: 상 → 중 → 하 */
export const DIFFICULTIES: Difficulty[] = [
  "advanced",
  "intermediate",
  "basic",
];

export const difficultyLabel: Record<Difficulty, string> = {
  basic: "하",
  intermediate: "중",
  advanced: "상",
};

import type { Difficulty, TopicCategory } from "@/types/content";

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

export interface LessonSection {
  id: string;
  title: string;
  difficulty?: Difficulty;
  blocks: ContentBlock[];
}

/** 한 페이지 분량의 학습 문서. 이후 CMS/DB row와 1:1 매핑 가능 */
export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: TopicCategory;
  difficulty: Difficulty;
  readingTime: string;
  relatedTermSlugs?: string[];
  sections: LessonSection[];
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  aliases?: string[];
  summary: string;
  detail: ContentBlock[];
  relatedSlugs?: string[];
  relatedLessonIds?: string[];
  category?: TopicCategory | "general";
  /** 상 · 중 · 하 — 사이드바·목록 뱃지 */
  difficulty?: Difficulty;
}

export interface ContentRepository {
  listTopics(): Promise<import("@/types/content").Topic[]>;
  getTopicBySlug(slug: string): Promise<import("@/types/content").Topic | null>;
  listTopicsByCategory(
    category: TopicCategory,
  ): Promise<import("@/types/content").Topic[]>;
  getLesson(id: string): Promise<Lesson | null>;
  listLessonsByCategory(category: TopicCategory): Promise<Lesson[]>;
  listGlossary(): Promise<GlossaryTerm[]>;
  getGlossaryTerm(slug: string): Promise<GlossaryTerm | null>;
}

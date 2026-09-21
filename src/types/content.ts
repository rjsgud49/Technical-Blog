export type Difficulty = "basic" | "intermediate" | "advanced";

/** 내장 + 관리자 추가 카테고리 (이후 DB string PK와 동일) */
export type TopicCategory = string;

export interface Topic {
  slug: string;
  title: string;
  description: string;
  category: TopicCategory;
  difficulty: Difficulty;
  href: string;
  readingTime?: string;
}

export interface NavSection {
  id: string;
  label: string;
  href: string;
  items?: {
    label: string;
    href: string;
    difficulty?: Difficulty;
  }[];
}

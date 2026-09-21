import type { ManagedPost } from "@/types/admin";
import type { ContentBlock, Lesson, LessonSection } from "@/types/lesson";
import type { TopicCategory } from "@/types/content";
import { p, h2 } from "@/lib/content/helpers";
import { DEFAULT_FIELD, fieldPath } from "@/lib/field-path";

/** 관리자 본문(텍스트) → Lesson 블록으로 변환 */
export function bodyToBlocks(body: string): ContentBlock[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    const text = paragraph.join("\n").trim();
    if (text) blocks.push(p(text));
    paragraph = [];
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      blocks.push(h2(line.slice(3).trim()));
      continue;
    }
    if (line.trim() === "") {
      flush();
      continue;
    }
    paragraph.push(line);
  }
  flush();

  if (blocks.length === 0) {
    blocks.push(p("(본문이 비어 있습니다.)"));
  }
  return blocks;
}

export function managedPostToLesson(post: ManagedPost): Lesson {
  const section: LessonSection = {
    id: "body",
    title: "본문",
    difficulty: post.difficulty,
    blocks: bodyToBlocks(post.body),
  };

  return {
    id: `managed/${post.slug}`,
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.categorySlug as TopicCategory,
    difficulty: post.difficulty,
    readingTime: post.readingTime,
    sections: [section],
  };
}

export function postPublicHref(post: ManagedPost) {
  const field = post.fieldSlug || DEFAULT_FIELD;
  // 개별 글 (수정·공유용)
  return fieldPath(field, `/c/${post.categorySlug}/${post.slug}`);
}

const SEED_CATEGORY_HREF: Record<string, string> = {
  history: fieldPath(DEFAULT_FIELD, "/history"),
  structure: fieldPath(DEFAULT_FIELD, "/structure"),
  hooks: fieldPath(DEFAULT_FIELD, "/hooks"),
  patterns: fieldPath(DEFAULT_FIELD, "/patterns"),
  glossary: fieldPath(DEFAULT_FIELD, "/glossary"),
};

/** 카테고리 공개 URL — React 시드는 /history 등, 그 외는 /c/{slug} */
export function categoryPublicHref(slug: string, fieldSlug = DEFAULT_FIELD) {
  if (fieldSlug === DEFAULT_FIELD && SEED_CATEGORY_HREF[slug]) {
    return SEED_CATEGORY_HREF[slug];
  }
  return fieldPath(fieldSlug, `/c/${slug}`);
}

/** 카테고리 본문 안 섹션 앵커 — React /history#origin 과 동일 패턴 */
export function postSectionHref(post: ManagedPost) {
  const field = post.fieldSlug || DEFAULT_FIELD;
  return `${categoryPublicHref(post.categorySlug, field)}#${post.slug}`;
}

/**
 * 해시 스크롤용 — Next redirect/router는 # 를 못 쓰므로 ?section= 로 변환.
 * ScrollToSection 이 받아서 스크롤 후 # 로 정리.
 */
export function postSectionNavHref(post: ManagedPost) {
  const href = postSectionHref(post);
  const hashIdx = href.indexOf("#");
  if (hashIdx === -1) return href;
  return `${href.slice(0, hashIdx)}?section=${encodeURIComponent(href.slice(hashIdx + 1))}`;
}

export function fieldHomeHref(fieldSlug = DEFAULT_FIELD) {
  return fieldPath(fieldSlug);
}

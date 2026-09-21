import type {
  Lesson,
  LessonSection,
  ContentBlock,
  GlossaryTerm,
} from "@/types/lesson";
import type { TopicCategory } from "@/types/content";
import { p } from "@/lib/content/helpers";

/** 훅·패턴처럼 글이 여러 Lesson인 카테고리를 history/structure식 한 페이지 시드로 합침 */
export function categorySeedFromLessons(
  meta: {
    id: string;
    slug: TopicCategory;
    title: string;
    description: string;
  },
  lessons: Lesson[],
): Lesson {
  const sections: LessonSection[] = lessons.map((lesson) => ({
    id: lesson.slug,
    title: lesson.title,
    difficulty: lesson.difficulty,
    blocks: flattenLessonBlocks(lesson),
  }));

  const mins = lessons.reduce((sum, l) => {
    const n = parseInt(l.readingTime, 10);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return {
    id: meta.id,
    slug: meta.slug,
    title: meta.title,
    description: meta.description,
    category: meta.slug,
    difficulty: lessons[0]?.difficulty ?? "basic",
    readingTime: mins > 0 ? `${mins} min` : "—",
    sections,
  };
}

/** 단어사전 용어 → 카테고리 펼침 시드 (수정·추가와 동일 경로) */
export function glossarySeedFromTerms(terms: GlossaryTerm[]): Lesson {
  const sorted = [...terms].sort((a, b) =>
    a.term.localeCompare(b.term, "en", { sensitivity: "base" }),
  );

  const sections: LessonSection[] = sorted.map((term) => {
    const blocks: ContentBlock[] = [];
    if (term.aliases && term.aliases.length > 0) {
      blocks.push(p(`별칭: ${term.aliases.join(" · ")}`));
    }
    blocks.push(p(term.summary));
    blocks.push(...term.detail);
    return {
      id: term.slug,
      title: term.term,
      difficulty: term.difficulty,
      blocks,
    };
  });

  return {
    id: "glossary",
    slug: "glossary",
    title: "단어사전",
    description:
      "React 핵심 용어를 한 페이지에서 바로 읽습니다. 로그인 후 용어를 수정·추가할 수 있습니다.",
    category: "glossary",
    difficulty: "basic",
    readingTime: `${sorted.length} terms`,
    sections,
  };
}

function flattenLessonBlocks(lesson: Lesson): ContentBlock[] {
  if (lesson.sections.length <= 1) {
    return lesson.sections[0]?.blocks ?? [];
  }
  const blocks: ContentBlock[] = [];
  for (const sec of lesson.sections) {
    blocks.push({
      type: "heading",
      level: 3,
      text: sec.title,
      id: `${lesson.slug}-${sec.id}`,
    });
    blocks.push(...sec.blocks);
  }
  return blocks;
}

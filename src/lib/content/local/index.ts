import type { Topic, TopicCategory } from "@/types/content";
import type { ContentRepository, Lesson } from "@/types/lesson";
import { glossaryTerms, getGlossaryTermLocal } from "./glossary";
import { lessons, getLessonById } from "./lessons";
import { DEFAULT_FIELD, fieldPath } from "@/lib/field-path";

function lessonToHref(lesson: Lesson): string {
  switch (lesson.category) {
    case "history":
      return fieldPath(DEFAULT_FIELD, "/history");
    case "structure":
      return fieldPath(DEFAULT_FIELD, "/structure");
    case "hooks":
      return fieldPath(DEFAULT_FIELD, `/hooks#${lesson.slug}`);
    case "patterns":
      return fieldPath(DEFAULT_FIELD, `/patterns#${lesson.slug}`);
    default:
      return fieldPath(DEFAULT_FIELD, `/c/${lesson.category}/${lesson.slug}`);
  }
}

function lessonToTopic(lesson: Lesson): Topic {
  return {
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    difficulty: lesson.difficulty,
    href: lessonToHref(lesson),
    readingTime: lesson.readingTime,
  };
}

/** lesson id → 라우트 (예: hooks/use-state → /react/hooks#use-state) */
export function lessonIdToHref(id: string): string {
  if (id.includes("/")) {
    const [category, ...rest] = id.split("/");
    const slug = rest.join("/");
    if (category === "hooks" || category === "patterns") {
      return fieldPath(DEFAULT_FIELD, `/${category}#${slug}`);
    }
    return fieldPath(DEFAULT_FIELD, `/${category}/${slug}`);
  }
  return fieldPath(DEFAULT_FIELD, `/${id}`);
}

export const localContentRepository: ContentRepository = {
  async listTopics() {
    return lessons.map(lessonToTopic);
  },

  async getTopicBySlug(slug) {
    const lesson = lessons.find((l) => l.slug === slug);
    return lesson ? lessonToTopic(lesson) : null;
  },

  async listTopicsByCategory(category: TopicCategory) {
    return lessons.filter((l) => l.category === category).map(lessonToTopic);
  },

  async getLesson(id) {
    return getLessonById(id);
  },

  async listLessonsByCategory(category: TopicCategory) {
    return lessons.filter((l) => l.category === category);
  },

  async listGlossary() {
    return [...glossaryTerms].sort((a, b) =>
      a.term.localeCompare(b.term, "en", { sensitivity: "base" }),
    );
  },

  async getGlossaryTerm(slug) {
    return getGlossaryTermLocal(slug);
  },
};

import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { categorySeedFromLessons } from "@/lib/content/category-seed";
import { getContentRepository } from "@/lib/content/repository";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "패턴",
};

export default async function PatternsPage() {
  const repo = getContentRepository();
  const lessons = await repo.listLessonsByCategory("patterns");
  const seedLesson = categorySeedFromLessons(
    {
      id: "patterns",
      slug: "patterns",
      title: "패턴",
      description:
        "Compound, HOC, State Colocation 등 자주 쓰는 React 구성 패턴을 한눈에 읽습니다.",
    },
    lessons,
  );

  return (
    <ManagedCategoryView
      slug="patterns"
      fieldSlug={DEFAULT_FIELD}
      seedLesson={seedLesson}
    />
  );
}

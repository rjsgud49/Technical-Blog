import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { categorySeedFromLessons } from "@/lib/content/category-seed";
import { getContentRepository } from "@/lib/content/repository";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "Hooks",
};

export default async function HooksPage() {
  const repo = getContentRepository();
  const lessons = await repo.listLessonsByCategory("hooks");
  const seedLesson = categorySeedFromLessons(
    {
      id: "hooks",
      slug: "hooks",
      title: "Hooks",
      description:
        "기본 훅부터 Concurrent 훅·커스텀 훅까지. 아래에서 바로 읽거나, 왼쪽 목차로 원하는 훅으로 이동하세요.",
    },
    lessons,
  );

  return (
    <ManagedCategoryView
      slug="hooks"
      fieldSlug={DEFAULT_FIELD}
      seedLesson={seedLesson}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { getContentRepository } from "@/lib/content/repository";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "React 역사",
};

export default async function HistoryPage() {
  const repo = getContentRepository();
  const lesson = await repo.getLesson("history");

  if (!lesson) {
    notFound();
  }

  return (
    <ManagedCategoryView
      slug="history"
      fieldSlug={DEFAULT_FIELD}
      seedLesson={lesson}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { getContentRepository } from "@/lib/content/repository";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "React 구조",
};

export default async function StructurePage() {
  const repo = getContentRepository();
  const lesson = await repo.getLesson("structure");

  if (!lesson) {
    notFound();
  }

  return (
    <ManagedCategoryView
      slug="structure"
      fieldSlug={DEFAULT_FIELD}
      seedLesson={lesson}
    />
  );
}

import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { glossarySeedFromTerms } from "@/lib/content/category-seed";
import { getContentRepository } from "@/lib/content/repository";
import { DEFAULT_FIELD } from "@/lib/field-path";

export const metadata: Metadata = {
  title: "단어사전",
};

export default async function GlossaryPage() {
  const repo = getContentRepository();
  const terms = await repo.listGlossary();
  const seedLesson = glossarySeedFromTerms(terms);

  return (
    <ManagedCategoryView
      slug="glossary"
      fieldSlug={DEFAULT_FIELD}
      seedLesson={seedLesson}
    />
  );
}

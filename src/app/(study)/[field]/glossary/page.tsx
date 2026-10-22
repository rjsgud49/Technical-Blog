import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import {
  DEFAULT_FIELD,
  isReservedFieldSlug,
  normalizeFieldSlug,
} from "@/lib/field-path";

interface PageProps {
  params: Promise<{ field: string }>;
}

export const metadata: Metadata = {
  title: "단어사전",
};

export default async function FieldGlossaryPage({ params }: PageProps) {
  const { field: raw } = await params;
  const field = normalizeFieldSlug(raw);
  if (!field || field === DEFAULT_FIELD || isReservedFieldSlug(field)) {
    notFound();
  }
  return <ManagedCategoryView slug="glossary" fieldSlug={field} />;
}

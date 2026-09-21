import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import {
  DEFAULT_FIELD,
  isReservedFieldSlug,
  normalizeFieldSlug,
} from "@/lib/field-path";

interface PageProps {
  params: Promise<{ field: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function FieldCategoryPage({ params }: PageProps) {
  const { field: raw, slug } = await params;
  const field = normalizeFieldSlug(raw);
  if (!field || field === DEFAULT_FIELD || isReservedFieldSlug(field)) {
    notFound();
  }
  return <ManagedCategoryView slug={slug} fieldSlug={field} />;
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  DEFAULT_FIELD,
  fieldPath,
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

export default async function FieldGlossaryTermRedirect({
  params,
}: PageProps) {
  const { field: raw, slug } = await params;
  const field = normalizeFieldSlug(raw);
  if (!field || field === DEFAULT_FIELD || isReservedFieldSlug(field)) {
    notFound();
  }
  redirect(
    `${fieldPath(field, "/glossary")}?section=${encodeURIComponent(slug)}`,
  );
}

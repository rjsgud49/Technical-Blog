import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ManagedPostView } from "@/components/content/ManagedPostView";
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

/** @deprecated 구 URL 호환 — 새 링크는 /{field}/c/{category}/{slug} */
export default async function FieldPostPage({ params }: PageProps) {
  const { field: raw, slug } = await params;
  const field = normalizeFieldSlug(raw);
  if (!field || field === DEFAULT_FIELD || isReservedFieldSlug(field)) {
    notFound();
  }
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">불러오는 중…</p>}>
      <ManagedPostView slug={slug} fieldSlug={field} />
    </Suspense>
  );
}

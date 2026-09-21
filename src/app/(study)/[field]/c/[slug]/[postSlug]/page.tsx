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
  params: Promise<{ field: string; slug: string; postSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { postSlug } = await params;
  return { title: postSlug };
}

/** /{field}/c/{category}/{post} — 관리 글 (posts 세그먼트 없음) */
export default async function FieldCategoryPostPage({ params }: PageProps) {
  const { field: raw, postSlug } = await params;
  const field = normalizeFieldSlug(raw);
  if (!field || field === DEFAULT_FIELD || isReservedFieldSlug(field)) {
    notFound();
  }
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">불러오는 중…</p>}>
      <ManagedPostView slug={postSlug} fieldSlug={field} />
    </Suspense>
  );
}

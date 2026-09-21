import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DEFAULT_FIELD, fieldPath } from "@/lib/field-path";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

/** 개별 패턴 URL → 카테고리 본문 앵커 */
export default async function PatternDetailRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(
    `${fieldPath(DEFAULT_FIELD, "/patterns")}?section=${encodeURIComponent(slug)}`,
  );
}

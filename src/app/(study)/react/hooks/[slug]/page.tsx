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

/** 개별 훅 URL → 카테고리 본문 앵커 (서비스에서도 목록/단독 페이지 없음) */
export default async function HookDetailRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(
    `${fieldPath(DEFAULT_FIELD, "/hooks")}?section=${encodeURIComponent(slug)}`,
  );
}

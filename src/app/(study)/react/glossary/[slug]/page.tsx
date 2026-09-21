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

/** 개별 용어 URL → 단어사전 본문 앵커 */
export default async function GlossaryTermRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(
    `${fieldPath(DEFAULT_FIELD, "/glossary")}?section=${encodeURIComponent(slug)}`,
  );
}

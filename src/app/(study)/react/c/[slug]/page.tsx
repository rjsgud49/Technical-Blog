import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ManagedCategoryView } from "@/components/content/ManagedCategoryView";
import { isBuiltinCategory } from "@/lib/admin/constants";
import { categoryPublicHref } from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD } from "@/lib/field-path";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

/** /react/c/{slug} — 시드 카테고리는 공식 URL(/hooks 등)로 통일 */
export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  if (isBuiltinCategory(slug)) {
    redirect(categoryPublicHref(slug, DEFAULT_FIELD));
  }
  return <ManagedCategoryView slug={slug} fieldSlug="react" />;
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { ManagedPostView } from "@/components/content/ManagedPostView";

interface PageProps {
  params: Promise<{ slug: string; postSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { postSlug } = await params;
  return { title: postSlug };
}

/** /react/c/{category}/{post} — 관리 글 */
export default async function ReactCategoryPostPage({ params }: PageProps) {
  const { postSlug } = await params;
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">불러오는 중…</p>}>
      <ManagedPostView slug={postSlug} fieldSlug="react" />
    </Suspense>
  );
}

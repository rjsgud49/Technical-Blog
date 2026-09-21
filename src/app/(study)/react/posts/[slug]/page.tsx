import { Suspense } from "react";
import type { Metadata } from "next";
import { ManagedPostView } from "@/components/content/ManagedPostView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">불러오는 중…</p>}>
      <ManagedPostView slug={slug} fieldSlug="react" />
    </Suspense>
  );
}

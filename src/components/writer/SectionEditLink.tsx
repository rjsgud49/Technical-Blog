"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { sectionToBody } from "@/lib/admin/lesson-to-body";
import { postPublicHref } from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD } from "@/lib/field-path";
import type { Difficulty } from "@/types/content";
import type { ContentBlock } from "@/types/lesson";

interface SectionEditLinkProps {
  categorySlug: string;
  fieldSlug?: string;
  sectionId: string;
  title: string;
  difficulty?: Difficulty;
  readingTime?: string;
  description?: string;
  blocks: ContentBlock[];
}

/** Vue 카테고리와 동일 — 섹션 제목 옆 「수정」 */
export function SectionEditLink({
  categorySlug,
  fieldSlug = DEFAULT_FIELD,
  sectionId,
  title,
  difficulty = "basic",
  readingTime = "5 min",
  description = "",
  blocks,
}: SectionEditLinkProps) {
  const { session, loading: authLoading } = useAuth();
  const { posts, createPost, loading } = useAdminContent();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const existing = posts.find(
    (p) =>
      p.slug === sectionId &&
      p.categorySlug === categorySlug &&
      (p.fieldSlug || DEFAULT_FIELD) === fieldSlug,
  );

  if (authLoading || !session) return null;

  async function startEdit() {
    setBusy(true);
    try {
      if (existing) {
        router.push(`${postPublicHref(existing)}?edit=1`);
        return;
      }
      const created = await createPost(
        {
          slug: sectionId,
          title,
          description,
          categorySlug,
          fieldSlug,
          difficulty,
          readingTime,
          body: sectionToBody({ title, blocks }),
          published: true,
        },
        session!.user.id,
      );
      router.push(`${postPublicHref(created)}?edit=1`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy || loading}
      onClick={() => void startEdit()}
      className="text-sm font-medium text-neutral-500 hover:text-primary-600 disabled:opacity-60"
    >
      {busy ? "…" : "수정"}
    </button>
  );
}

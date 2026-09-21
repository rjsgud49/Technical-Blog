"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PostEditor } from "@/components/writer/PostEditor";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import {
  categoryPublicHref,
  postPublicHref,
  postSectionNavHref,
} from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";
import { slugsEqual } from "@/lib/slugify";

/** 단독 글 URL은 수정(?edit=1)만 — 읽기는 카테고리 펼침 본문으로 */
export function ManagedPostView({
  slug,
  fieldSlug = DEFAULT_FIELD,
}: {
  slug: string;
  fieldSlug?: string;
}) {
  const { session } = useAuth();
  const { posts, loading } = useAdminContent();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const home = fieldHome(fieldSlug);

  const wantEdit = searchParams.get("edit") === "1";
  const canEdit = Boolean(session) && wantEdit;

  const post = useMemo(() => {
    if (loading) return undefined;
    const found =
      posts.find(
        (p) =>
          slugsEqual(p.slug, slug) &&
          (p.fieldSlug || DEFAULT_FIELD) === fieldSlug,
      ) ?? null;
    if (!found || (!found.published && !session)) return null;
    return found;
  }, [posts, slug, fieldSlug, loading, session]);

  // 구 URL /posts/{slug} → /c/{category}/{slug}
  useEffect(() => {
    if (!post) return;
    if (!pathname.includes("/posts/")) return;
    const canonical = postPublicHref(post);
    const q = searchParams.toString();
    router.replace(q ? `${canonical}?${q}` : canonical);
  }, [post, pathname, router, searchParams]);

  // 읽기 → 카테고리 본문 앵커
  useEffect(() => {
    if (!post || loading) return;
    if (canEdit) return;
    router.replace(postSectionNavHref(post));
  }, [post, loading, canEdit, router]);

  if (post === undefined) {
    return <p className="text-sm text-neutral-500">글을 불러오는 중…</p>;
  }

  if (!post) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-600">글을 찾을 수 없습니다.</p>
        <Link
          href={home}
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          ← 홈으로
        </Link>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <p className="text-sm text-neutral-500">카테고리 본문으로 이동 중…</p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">카테고리 본문에서 수정 중</p>
        <button
          type="button"
          onClick={() => {
            window.location.href = postSectionNavHref(post);
          }}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          본문으로
        </button>
      </div>
      <PostEditor
        key={post.id}
        postId={post.id}
        compact
        onCancel={() => {
          window.location.href = postSectionNavHref(post);
        }}
        onSaved={(saved) => {
          window.location.href = postSectionNavHref(saved);
        }}
        onDeleted={() => {
          router.push(categoryPublicHref(post.categorySlug, fieldSlug));
        }}
      />
    </div>
  );
}

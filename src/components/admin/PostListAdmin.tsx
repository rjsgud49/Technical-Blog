"use client";

import Link from "next/link";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { difficultyLabel } from "@/lib/admin/constants";
import { postPublicHref } from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";

export function PostListAdmin() {
  const { posts, deletePost, loading } = useAdminContent();

  async function onDelete(id: string, title: string) {
    if (!confirm(`「${title}」글을 삭제할까요?`)) return;
    try {
      await deletePost(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">글</h1>
          <p className="mt-1 text-sm text-neutral-500">
            작성 · 수정 · 삭제. 공개된 글은 /c/[카테고리]/[slug] 로 노출됩니다.
          </p>
        </div>
        <Link
          href={fieldHome(DEFAULT_FIELD)}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
        >
          카테고리에서 글쓰기
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중…</p>
      ) : posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          아직 작성한 글이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-neutral-900">{post.title}</p>
                  {!post.published && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      비공개
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  {post.categorySlug} · {difficultyLabel[post.difficulty]} ·{" "}
                  {post.slug}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={postPublicHref(post)}
                  className="rounded-lg px-3 py-1.5 text-primary-600 hover:bg-primary-50"
                >
                  보기
                </Link>
                <Link
                  href={`${postPublicHref(post)}?edit=1`}
                  className="rounded-lg px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => void onDelete(post.id, post.title)}
                  className="rounded-lg px-3 py-1.5 text-error-600 hover:bg-error-50"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

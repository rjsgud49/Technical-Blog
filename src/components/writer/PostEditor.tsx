"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { DIFFICULTIES, difficultyLabel } from "@/lib/admin/constants";
import { categoryPublicHref, postPublicHref, postSectionNavHref } from "@/lib/admin/post-mapper";
import { WysiwygEditor } from "@/components/writer/WysiwygEditor";
import { plainTextToHtml } from "@/lib/admin/html-body";
import { DEFAULT_FIELD, fieldFromPathname, fieldHome } from "@/lib/field-path";
import { slugify } from "@/lib/slugify";
import type { Difficulty } from "@/types/content";
import type { ManagedPost } from "@/types/admin";

interface PostEditorProps {
  postId?: string;
  /** URL ?category= 또는 인라인에서 고정 */
  defaultCategory?: string;
  /** true면 헤더/목록 링크 최소화 (인라인 수정용) */
  compact?: boolean;
  /** 저장 후 이동 (기본: 공개 글 URL) */
  onSaved?: (post: ManagedPost) => void;
  onCancel?: () => void;
  /** 삭제 후 콜백 (없으면 카테고리 목록으로) */
  onDeleted?: () => void;
}

export function PostEditor({
  postId,
  defaultCategory,
  compact = false,
  onSaved,
  onCancel,
  onDeleted,
}: PostEditorProps) {
  const { session } = useAuth();
  const { categories, posts, loading } = useAdminContent();
  const pathname = usePathname();
  const fieldSlug = fieldFromPathname(pathname);

  const fieldCategories = useMemo(
    () =>
      categories.filter(
        (c) => (c.fieldSlug || DEFAULT_FIELD) === fieldSlug,
      ),
    [categories, fieldSlug],
  );

  const initialCategory = useMemo(() => {
    if (defaultCategory) return defaultCategory;
    return fieldCategories[0]?.slug ?? categories[0]?.slug ?? "hooks";
  }, [defaultCategory, fieldCategories, categories]);

  const editing = postId ? posts.find((p) => p.id === postId) : undefined;

  if (!session) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-neutral-700">글을 쓰려면 로그인이 필요해요.</p>
        <Link
          href={`/login?next=${encodeURIComponent(fieldHome(fieldSlug))}`}
          className="mt-4 inline-flex rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (postId && loading) {
    return <p className="text-sm text-neutral-500">불러오는 중…</p>;
  }

  if (postId && !editing) {
    return (
      <p className="text-sm text-error-600" role="alert">
        글을 찾을 수 없습니다.
      </p>
    );
  }

  return (
    <PostEditorForm
      key={postId ?? `new-${initialCategory}`}
      postId={postId}
      initialPost={editing}
      initialCategory={initialCategory}
      fieldCategories={fieldCategories}
      fieldSlug={fieldSlug}
      compact={compact}
      onSaved={onSaved}
      onCancel={onCancel}
      onDeleted={onDeleted}
    />
  );
}

function PostEditorForm({
  postId,
  initialPost,
  initialCategory,
  fieldCategories,
  fieldSlug,
  compact,
  onSaved,
  onCancel,
  onDeleted,
}: {
  postId?: string;
  initialPost?: ManagedPost;
  initialCategory: string;
  fieldCategories: { id: string; slug: string; label: string }[];
  fieldSlug: string;
  compact: boolean;
  onSaved?: (post: ManagedPost) => void;
  onCancel?: () => void;
  onDeleted?: () => void;
}) {
  const { session } = useAuth();
  const { createPost, updatePost, deletePost } = useAdminContent();
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [description, setDescription] = useState(
    initialPost?.description ?? "",
  );
  const [categorySlug, setCategorySlug] = useState(
    initialPost?.categorySlug ?? initialCategory,
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialPost?.difficulty ?? "basic",
  );
  const [readingTime, setReadingTime] = useState(
    initialPost?.readingTime ?? "",
  );
  const [body, setBody] = useState(
    initialPost ? plainTextToHtml(initialPost.body) : "",
  );
  const [published, setPublished] = useState(initialPost?.published ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 새 글: 제목 → 슬러그 자동 / 수정: 기존 슬러그 유지
  const autoSlug = postId
    ? (initialPost?.slug ?? slugify(title))
    : slugify(title);

  function onTitleChange(value: string) {
    setTitle(value);
  }

  function isBodyEmpty(html: string) {
    const text = html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    return text.length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (isBodyEmpty(body)) {
      setError("본문을 입력하세요.");
      return;
    }
    const finalSlug = autoSlug;
    if (!finalSlug) {
      setError("제목에서 URL 경로를 만들 수 없습니다.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const htmlBody = plainTextToHtml(body);
      if (postId) {
        const updated = await updatePost(postId, {
          title,
          slug: finalSlug,
          description,
          categorySlug,
          difficulty,
          readingTime: readingTime || undefined,
          body: htmlBody,
          published,
        });
        if (onSaved) onSaved(updated);
        else router.push(postSectionNavHref(updated));
      } else {
        const created = await createPost(
          {
            title,
            slug: finalSlug,
            description,
            categorySlug,
            fieldSlug,
            difficulty,
            readingTime: readingTime || undefined,
            body: htmlBody,
            published,
          },
          session.user.id,
        );
        if (onSaved) onSaved(created);
        else router.push(postSectionNavHref(created));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!postId || !initialPost) return;
    if (
      !confirm(
        `「${initialPost.title}」을(를) 삭제할까요? 되돌릴 수 없습니다.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const cat = initialPost.categorySlug;
      await deletePost(postId);
      if (onDeleted) onDeleted();
      else router.push(categoryPublicHref(cat, fieldSlug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
      {!compact && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
              Writer
            </p>
            <h1 className="mt-1 text-2xl font-bold text-neutral-900">
              {postId ? "글 다듬기" : "새 글 쓰기"}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              본문을 적으면 사이드바·목록에 바로 반영돼요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {postId && initialPost && (
              <Link
                href={postPublicHref(initialPost)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                읽는 화면
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">카테고리</span>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className={inputClass}
            required
          >
            {fieldCategories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-700">난이도</span>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  difficulty === d
                    ? d === "basic"
                      ? "bg-success-50 text-success-700 ring-1 ring-success-500/30"
                      : d === "intermediate"
                        ? "bg-warning-50 text-warning-700 ring-1 ring-warning-500/30"
                        : "bg-error-50 text-error-700 ring-1 ring-error-500/30"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {difficultyLabel[d]}
              </button>
            ))}
          </div>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-neutral-700">제목</span>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`${inputClass} text-lg font-semibold`}
          placeholder="독자가 바로 이해할 제목"
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-neutral-700">한 줄 요약</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="목록에 보일 짧은 소개"
          required
        />
      </label>

      <div className="block space-y-1.5">
        <span className="text-sm font-medium text-neutral-700">본문</span>
        <WysiwygEditor
          value={body}
          onChange={setBody}
          minHeightClass={compact ? "min-h-48" : "min-h-72"}
          placeholder="보이는 그대로 작성하세요. 제목·굵게·목록·코드·링크를 지원합니다."
        />
      </div>

      <details className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-neutral-600">
          고급 옵션 (읽는 시간)
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-neutral-400">
            경로 자동: /{fieldSlug}/c/{categorySlug}/{autoSlug || "…"}
          </p>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-500">
              읽는 시간 (비우면 자동)
            </span>
            <input
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
              className={inputClass}
              placeholder="5 min"
            />
          </label>
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded border-neutral-300"
          />
          바로 공개
        </label>
        <div className="flex flex-wrap gap-2">
          {postId && (
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={saving || deleting}
              className="h-10 rounded-lg px-4 text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-60"
            >
              {deleting ? "삭제 중…" : "삭제"}
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-lg px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={saving || deleting}
            className="h-10 rounded-lg bg-primary-500 px-5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {saving ? "저장 중…" : postId ? "수정 반영" : "발행하기"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

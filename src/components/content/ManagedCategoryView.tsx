"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { HtmlBody } from "@/components/content/HtmlBody";
import { WriteCta } from "@/components/writer/WriteCta";
import { SectionEditLink } from "@/components/writer/SectionEditLink";
import { ScrollToSection } from "@/components/content/ScrollToSection";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { isHtmlBody } from "@/lib/admin/html-body";
import { bodyToBlocks, postPublicHref } from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";
import { slugsEqual } from "@/lib/slugify";
import type { ManagedPost } from "@/types/admin";
import type { ContentBlock, Lesson, LessonSection } from "@/types/lesson";
import type { Difficulty } from "@/types/content";

type DisplaySection = {
  key: string;
  id: string;
  title: string;
  difficulty?: Difficulty;
  description?: string;
  blocks: ContentBlock[] | null;
  html: string | null;
  post: ManagedPost | null;
  seed: LessonSection | null;
};

export function ManagedCategoryView({
  slug,
  fieldSlug = DEFAULT_FIELD,
  seedLesson,
}: {
  slug: string;
  fieldSlug?: string;
  /** React 시드(history·structure 등) — Vue와 같은 읽기+섹션 수정 UI */
  seedLesson?: Lesson | null;
}) {
  const { session } = useAuth();
  const { categories, posts, loading } = useAdminContent();
  const home = fieldHome(fieldSlug);

  const category = useMemo(() => {
    if (loading) return undefined;
    const found =
      categories.find(
        (c) =>
          slugsEqual(c.slug, slug) &&
          (c.fieldSlug || DEFAULT_FIELD) === fieldSlug,
      ) ?? null;
    if (found) return found;
    // 시드 카테고리만 있고 DB/로컬에 커스텀 row가 없을 때
    if (seedLesson && seedLesson.category === slug) {
      return {
        id: `seed-${slug}`,
        slug,
        label: seedLesson.title,
        navLabel: undefined as string | undefined,
        description: seedLesson.description,
        fieldSlug,
        order: 0,
        builtin: true,
        createdAt: "",
        updatedAt: "",
      };
    }
    return null;
  }, [categories, slug, fieldSlug, loading, seedLesson]);

  const fieldPosts = useMemo(() => {
    let list = posts.filter(
      (p) =>
        slugsEqual(p.categorySlug, slug) &&
        (p.fieldSlug || DEFAULT_FIELD) === fieldSlug,
    );
    if (!session) {
      list = list.filter((p) => p.published);
    }
    return [...list].sort(
      (a, b) => a.order - b.order || b.updatedAt.localeCompare(a.updatedAt),
    );
  }, [posts, slug, fieldSlug, session]);

  const sections = useMemo((): DisplaySection[] => {
    const bySlug = new Map(fieldPosts.map((p) => [p.slug, p]));
    const out: DisplaySection[] = [];

    if (seedLesson) {
      for (const sec of seedLesson.sections) {
        const post = bySlug.get(sec.id);
        if (post) {
          bySlug.delete(sec.id);
          out.push({
            key: post.id,
            id: post.slug,
            title: post.published ? post.title : `[비공개] ${post.title}`,
            difficulty: post.difficulty,
            description: post.description,
            blocks: isHtmlBody(post.body) ? null : bodyToBlocks(post.body),
            html: isHtmlBody(post.body) ? post.body : null,
            post,
            seed: sec,
          });
        } else {
          out.push({
            key: `seed:${sec.id}`,
            id: sec.id,
            title: sec.title,
            difficulty: sec.difficulty,
            description: undefined,
            blocks: sec.blocks,
            html: null,
            post: null,
            seed: sec,
          });
        }
      }
    }

    for (const post of bySlug.values()) {
      out.push({
        key: post.id,
        id: post.slug,
        title: post.published ? post.title : `[비공개] ${post.title}`,
        difficulty: post.difficulty,
        description: post.description,
        blocks: isHtmlBody(post.body) ? null : bodyToBlocks(post.body),
        html: isHtmlBody(post.body) ? post.body : null,
        post,
        seed: null,
      });
    }

    return out;
  }, [seedLesson, fieldPosts]);

  const totalReading = useMemo(() => {
    if (seedLesson?.readingTime && fieldPosts.length === 0) {
      return seedLesson.readingTime;
    }
    const mins = fieldPosts.reduce((sum, p) => {
      const n = parseInt(p.readingTime, 10);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    if (mins > 0) return `${mins} min`;
    return seedLesson?.readingTime ?? null;
  }, [fieldPosts, seedLesson]);

  if (category === undefined) {
    return <p className="text-sm text-neutral-500">불러오는 중…</p>;
  }

  if (!category) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-600">카테고리를 찾을 수 없습니다.</p>
        <Link
          href={home}
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          ← 홈으로
        </Link>
      </div>
    );
  }

  const title = seedLesson?.title ?? category.label;
  const description =
    seedLesson?.description ||
    category.description?.trim() ||
    "왼쪽 목차에서 주제를 고르거나, 아래에서 바로 읽어 보세요.";
  const leadDifficulty =
    seedLesson?.difficulty ?? sections[0]?.difficulty ?? fieldPosts[0]?.difficulty;
  const tagLabel = category.navLabel || category.label;

  return (
    <article>
      <Suspense fallback={null}>
        <ScrollToSection ready={!loading && sections.length > 0} />
      </Suspense>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <Breadcrumb
          items={[
            { label: "Home", href: home },
            { label: tagLabel },
          ]}
        />
        <WriteCta
          categorySlug={category.slug}
          variant="subtle"
          label={slug === "glossary" ? "용어 추가" : undefined}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          {title}
        </h1>
        {leadDifficulty && (
          <DifficultyBadge level={leadDifficulty} size="md" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
        {totalReading && <span>읽는 시간 {totalReading}</span>}
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
          {tagLabel}
        </span>
      </div>

      <p className="mt-4 max-w-prose text-base leading-relaxed text-neutral-600">
        {description}
      </p>

      <WriteCta
        categorySlug={category.slug}
        variant="banner"
        label={slug === "glossary" ? "용어 추가하기" : undefined}
      />

      {sections.length > 1 && (
        <nav className="mt-6 flex flex-wrap gap-4 border-b border-neutral-200 pb-3 text-sm">
          {sections.map((sec) => (
            <a
              key={sec.key}
              href={`#${sec.id}`}
              className="font-medium text-neutral-500 transition-colors hover:text-primary-600"
            >
              {sec.title}
            </a>
          ))}
        </nav>
      )}

      {sections.length === 0 ? (
        <p className="mt-10 text-sm text-neutral-500">
          아직 글이 없습니다. 로그인 후 위에서 바로 작성할 수 있어요.
        </p>
      ) : (
        <div className="mt-10 space-y-14">
          {sections.map((sec) => (
            <section key={sec.key} id={sec.id} className="scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                    {sec.title}
                  </h2>
                  {sec.difficulty && (
                    <DifficultyBadge level={sec.difficulty} />
                  )}
                </div>
                {sec.post ? (
                  session && (
                    <Link
                      href={`${postPublicHref(sec.post)}?edit=1`}
                      className="text-sm font-medium text-neutral-500 hover:text-primary-600"
                    >
                      수정
                    </Link>
                  )
                ) : sec.seed ? (
                  <SectionEditLink
                    categorySlug={slug}
                    fieldSlug={fieldSlug}
                    sectionId={sec.seed.id}
                    title={sec.seed.title}
                    difficulty={sec.seed.difficulty}
                    readingTime={seedLesson?.readingTime}
                    description={seedLesson?.description}
                    blocks={sec.seed.blocks}
                  />
                ) : null}
              </div>
              {sec.description && (
                <p className="mb-4 max-w-prose text-sm text-neutral-500">
                  {sec.description}
                </p>
              )}
              {sec.html ? (
                <HtmlBody html={sec.html} />
              ) : sec.blocks ? (
                <ContentRenderer blocks={sec.blocks} />
              ) : null}
            </section>
          ))}
        </div>
      )}
    </article>
  );
}

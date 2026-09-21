import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { TermLink } from "@/components/content/TermLink";
import { WriteCta } from "@/components/writer/WriteCta";
import { SectionEditLink } from "@/components/writer/SectionEditLink";
import { getContentRepository } from "@/lib/content/repository";
import { DEFAULT_FIELD, fieldPath } from "@/lib/field-path";
import type { Lesson } from "@/types/lesson";

const categoryLabel: Record<string, string> = {
  history: "역사",
  structure: "구조",
  hooks: "Hooks",
  patterns: "패턴",
};

const categoryHref: Record<string, string> = {
  history: fieldPath(DEFAULT_FIELD, "/history"),
  structure: fieldPath(DEFAULT_FIELD, "/structure"),
  hooks: fieldPath(DEFAULT_FIELD, "/hooks"),
  patterns: fieldPath(DEFAULT_FIELD, "/patterns"),
};

interface ArticleLayoutProps {
  lesson: Lesson;
  backLabel?: string;
  showSectionNav?: boolean;
  /** 본문 섹션 앞에 삽입 (아이콘 모음 등) */
  beforeBody?: React.ReactNode;
}

export async function ArticleLayout({
  lesson,
  backLabel,
  showSectionNav = true,
  beforeBody,
}: ArticleLayoutProps) {
  const parentHref =
    categoryHref[lesson.category] ??
    fieldPath(DEFAULT_FIELD, `/c/${lesson.category}`);
  const parentLabel = categoryLabel[lesson.category] ?? lesson.category;
  const isIndexLesson =
    lesson.id === lesson.category || lesson.slug === lesson.category;

  const repo = getContentRepository();
  const relatedTerms = lesson.relatedTermSlugs
    ? (
        await Promise.all(
          lesson.relatedTermSlugs.map((slug) => repo.getGlossaryTerm(slug)),
        )
      ).filter(Boolean)
    : [];

  return (
    <article>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <Breadcrumb
          items={[
            { label: "Home", href: fieldPath(DEFAULT_FIELD) },
            ...(isIndexLesson
              ? [{ label: parentLabel }]
              : [
                  { label: parentLabel, href: parentHref },
                  { label: lesson.title },
                ]),
          ]}
        />
        <WriteCta categorySlug={lesson.category} variant="subtle" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          {lesson.title}
        </h1>
        <DifficultyBadge level={lesson.difficulty} size="md" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
        <span>읽는 시간 {lesson.readingTime}</span>
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
          {parentLabel}
        </span>
      </div>

      <p className="mt-4 max-w-prose text-base leading-relaxed text-neutral-600">
        {lesson.description}
      </p>

      <WriteCta categorySlug={lesson.category} variant="banner" />

      {showSectionNav && lesson.sections.length > 1 && (
        <nav className="mt-6 flex flex-wrap gap-4 border-b border-neutral-200 pb-3 text-sm">
          {lesson.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="font-medium text-neutral-500 transition-colors hover:text-primary-600"
            >
              {section.title}
            </a>
          ))}
        </nav>
      )}

      {beforeBody && <div className="mt-10">{beforeBody}</div>}

      <div className="mt-10 space-y-14">
        {lesson.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {section.title}
                </h2>
                {section.difficulty && (
                  <DifficultyBadge level={section.difficulty} />
                )}
              </div>
              <SectionEditLink
                categorySlug={lesson.category}
                fieldSlug={DEFAULT_FIELD}
                sectionId={
                  lesson.sections.length === 1 ? lesson.slug : section.id
                }
                title={
                  lesson.sections.length === 1 ? lesson.title : section.title
                }
                difficulty={section.difficulty ?? lesson.difficulty}
                readingTime={lesson.readingTime}
                description={lesson.description}
                blocks={section.blocks}
              />
            </div>
            <ContentRenderer blocks={section.blocks} />
          </section>
        ))}
      </div>

      {relatedTerms.length > 0 && (
        <footer className="mt-14 border-t border-neutral-200 pt-8">
          <h2 className="text-sm font-semibold text-neutral-800">관련 용어</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relatedTerms.map((t) =>
              t ? (
                <li key={t.slug}>
                  <TermLink
                    slug={t.slug}
                    className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    {t.term}
                  </TermLink>
                </li>
              ) : null,
            )}
          </ul>
          <p className="mt-2 text-xs text-neutral-400">
            본문의 파란 링크와 위 태그는 모두{" "}
            <Link
              href={fieldPath(DEFAULT_FIELD, "/glossary")}
              className="text-primary-600 hover:underline"
            >
              단어사전
            </Link>
            으로 연결됩니다.
          </p>
        </footer>
      )}

      {backLabel && !isIndexLesson && (
        <div className="mt-10">
          <Link
            href={parentHref}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            ← {backLabel}
          </Link>
        </div>
      )}
    </article>
  );
}

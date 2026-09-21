"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FieldHomeHero } from "@/components/content/FieldHomeHero";
import { WriteCta } from "@/components/writer/WriteCta";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { categoryPublicHref } from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD } from "@/lib/field-path";

export function FieldHomeView({ fieldSlug }: { fieldSlug: string }) {
  const { session } = useAuth();
  const { categories, posts } = useAdminContent();

  const fieldCategories = useMemo(
    () =>
      categories
        .filter((c) => (c.fieldSlug || DEFAULT_FIELD) === fieldSlug)
        .sort((a, b) => a.order - b.order),
    [categories, fieldSlug],
  );

  const postCount = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.published && (p.fieldSlug || DEFAULT_FIELD) === fieldSlug,
      ).length,
    [posts, fieldSlug],
  );

  return (
    <div>
      <FieldHomeHero fieldSlug={fieldSlug}>
        <p className="mt-2 text-sm text-neutral-400">
          경로{" "}
          <span className="font-mono text-neutral-600">/{fieldSlug}</span>
          {fieldCategories.length > 0 && (
            <>
              {" "}
              · 카테고리 {fieldCategories.length} · 글 {postCount}
            </>
          )}
        </p>
      </FieldHomeHero>

      {session && fieldCategories.length > 0 && (
        <WriteCta
          variant="banner"
          label="이 분야에 글쓰기"
          categorySlug={fieldCategories[0]?.slug}
          className="mt-2"
        />
      )}
      {session && fieldCategories.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">
          사이드바에서 카테고리를 먼저 추가한 뒤 글을 작성하세요.
        </p>
      )}

      <div className="mt-10 space-y-3">
        {fieldCategories.length === 0 ? (
          <p className="text-sm text-neutral-500">
            {session
              ? "사이드바 + 버튼으로 카테고리를 추가한 뒤 글을 작성하세요."
              : "아직 공개된 카테고리가 없습니다."}
          </p>
        ) : (
          fieldCategories.map((cat) => (
            <Link
              key={cat.id}
              href={categoryPublicHref(cat.slug, fieldSlug)}
              className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-neutral-800">
                {cat.label}
              </h2>
              {cat.description && (
                <p className="mt-2 text-sm text-neutral-500">
                  {cat.description}
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

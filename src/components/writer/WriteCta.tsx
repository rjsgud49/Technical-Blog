"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { PostEditor } from "@/components/writer/PostEditor";
import { postSectionNavHref } from "@/lib/admin/post-mapper";

interface WriteCtaProps {
  /** 미리 고를 카테고리 슬러그 */
  categorySlug?: string;
  variant?: "primary" | "subtle" | "banner";
  label?: string;
  className?: string;
}

/** 카테고리 페이지에서 바로 글을 쓰는 진입점 (별도 글쓰기 페이지 없음) */
export function WriteCta({
  categorySlug,
  variant = "primary",
  label,
  className = "",
}: WriteCtaProps) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (loading || !session) return null;

  const text =
    label ??
    (categorySlug ? "이 카테고리에 글쓰기" : "새 글 쓰기");

  const editor = open ? (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 md:p-6">
      <PostEditor
        defaultCategory={categorySlug}
        compact
        onCancel={() => setOpen(false)}
        onSaved={(post) => {
          setOpen(false);
          router.push(postSectionNavHref(post));
        }}
      />
    </div>
  ) : null;

  if (variant === "banner") {
    return (
      <div className={className}>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
          <p className="text-sm text-primary-800">
            이 카테고리에서 바로 글을 작성할 수 있어요.
          </p>
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 rounded-lg bg-primary-500 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
            >
              {text}
            </button>
          )}
        </div>
        {editor}
      </div>
    );
  }

  const btnClass =
    variant === "subtle"
      ? `inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 ${className}`
      : `inline-flex items-center rounded-lg bg-primary-500 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-primary-600 ${className}`;

  return (
    <div className={variant === "subtle" || variant === "primary" ? className : undefined}>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className={btnClass}>
          {text}
        </button>
      )}
      {editor}
    </div>
  );
}

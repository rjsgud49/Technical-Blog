"use client";

import Link from "next/link";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";

export function AdminDashboard() {
  const { posts, categories, loading } = useAdminContent();
  const published = posts.filter((p) => p.published).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">대시보드</h1>
        <p className="mt-1 text-sm text-neutral-500">
          글은 카테고리 페이지에서 바로 쓰고, 카테고리 추가는 사이드바 + 로 합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="전체 글" value={loading ? "…" : String(posts.length)} />
        <Stat label="공개 글" value={loading ? "…" : String(published)} />
        <Stat
          label="카테고리"
          value={loading ? "…" : String(categories.length)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={fieldHome(DEFAULT_FIELD)}
          className="rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
        >
          학습 홈으로
        </Link>
        <Link
          href="/admin/posts"
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          글 목록
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

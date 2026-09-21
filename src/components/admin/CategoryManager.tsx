"use client";

import { FormEvent, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { fieldFromPathname } from "@/lib/field-path";
import { slugify } from "@/lib/slugify";

export function CategoryManager() {
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminContent();
  const pathname = usePathname();
  const fieldSlug = fieldFromPathname(pathname);

  const [label, setLabel] = useState("");
  const [navLabel, setNavLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const autoSlug = useMemo(() => slugify(label), [label]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!autoSlug) throw new Error("카테고리명에서 경로를 만들 수 없습니다.");
      await createCategory({
        label,
        slug: autoSlug,
        navLabel,
        description,
        fieldSlug,
      });
      setLabel("");
      setNavLabel("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "추가 실패");
    } finally {
      setSaving(false);
    }
  }

  async function onRename(id: string, current: string) {
    const next = prompt("카테고리 이름", current);
    if (!next || next === current) return;
    try {
      await updateCategory(id, { label: next });
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정 실패");
    }
  }

  async function onDelete(id: string, name: string, builtin?: boolean) {
    if (builtin) {
      alert("내장 카테고리는 삭제할 수 없습니다.");
      return;
    }
    if (!confirm(`「${name}」카테고리를 삭제할까요?`)) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">카테고리</h1>
        <p className="mt-1 text-sm text-neutral-500">
          경로는 카테고리명에서 자동으로 만들어집니다. 내장 카테고리는 삭제할 수
          없습니다.
        </p>
      </div>

      <form
        onSubmit={(e) => void onCreate(e)}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="text-sm font-semibold text-neutral-800">새 카테고리</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={navLabel}
            onChange={(e) => setNavLabel(e.target.value)}
            placeholder="네비 이름 (예: 서비스)"
            className={inputClass}
            required
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="카테고리명"
            className={inputClass}
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            className={inputClass}
          />
        </div>
        <p className="text-xs text-neutral-400">
          경로 자동: /{fieldSlug}/c/{autoSlug || "…"}
        </p>
        {error && (
          <p className="text-sm text-error-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving || !autoSlug}
          className="h-10 rounded-lg bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {saving ? "추가 중…" : "카테고리 추가"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중…</p>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div>
                <p className="font-semibold text-neutral-900">
                  {cat.label}
                  {cat.builtin && (
                    <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                      내장
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {cat.navLabel ? `네비: ${cat.navLabel} · ` : ""}
                  /{cat.fieldSlug || fieldSlug}/c/{cat.slug}
                  {cat.description ? ` · ${cat.description}` : ""}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => void onRename(cat.id, cat.label)}
                  className="rounded-lg px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
                >
                  이름 수정
                </button>
                <button
                  type="button"
                  disabled={cat.builtin}
                  onClick={() => void onDelete(cat.id, cat.label, cat.builtin)}
                  className="rounded-lg px-3 py-1.5 text-error-600 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-40"
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

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

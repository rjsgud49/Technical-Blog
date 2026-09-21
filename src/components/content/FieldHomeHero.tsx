"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  hydrateFieldHomeFromApi,
  updateFieldHomeAsync,
} from "@/lib/admin/field-home-store";
import { useFieldHome } from "@/lib/admin/use-field-home";
import { fileToLogoDataUrl, resolveFieldLogo } from "@/lib/brand";
import { isApiMode } from "@/lib/data-mode";
import { fieldHome } from "@/lib/field-path";

interface FieldHomeHeroProps {
  fieldSlug: string;
  /** 제목·소개 아래 추가 UI (난이도 뱃지 등) */
  children?: React.ReactNode;
}

export function FieldHomeHero({ fieldSlug, children }: FieldHomeHeroProps) {
  const { session } = useAuth();
  const home = useFieldHome(fieldSlug);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(home.title);
  const [description, setDescription] = useState(home.description);
  const [tagline, setTagline] = useState(home.tagline);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(
    home.logoDataUrl,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isApiMode()) {
      void hydrateFieldHomeFromApi(fieldSlug);
    }
  }, [fieldSlug]);

  function startEdit() {
    setTitle(home.title);
    setDescription(home.description);
    setTagline(home.tagline);
    setLogoDataUrl(home.logoDataUrl);
    setError(null);
    setEditing(true);
  }

  async function onLogoFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToLogoDataUrl(file);
      setLogoDataUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로고 업로드 실패");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateFieldHomeAsync(fieldSlug, {
        title,
        description,
        tagline,
        logoDataUrl,
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  const previewSrc = resolveFieldLogo(logoDataUrl);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Breadcrumb
          items={[{ label: "Home", href: fieldHome(fieldSlug) }]}
        />
        {session && !editing && (
          <button
            type="button"
            onClick={startEdit}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            홈 정보 수정
          </button>
        )}
      </div>

      {editing && session ? (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
        >
          <p className="text-xs font-semibold text-neutral-700">홈 정보 수정</p>

          <div className="space-y-2">
            <span className="text-[11px] font-medium text-neutral-500">
              분야 로고
            </span>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg"
                  className="sr-only"
                  aria-label="분야 로고 선택"
                  onChange={(e) => void onLogoFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 ring-1 ring-neutral-200 hover:bg-neutral-50"
                >
                  이미지 올리기 (PNG · SVG)
                </button>
                {logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrl(null)}
                    className="ml-2 text-[11px] text-neutral-400 hover:text-error-600"
                  >
                    기본 로고로 되돌리기
                  </button>
                )}
                <p className="text-[10px] text-neutral-400">
                  비우면 사이트 기본 로고를 씁니다
                </p>
              </div>
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-[11px] font-medium text-neutral-500">
              제목
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-lg font-semibold outline-none focus:border-primary-500"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-medium text-neutral-500">
              소개 글
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary-500"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-medium text-neutral-500">
              사이드바 한 줄
            </span>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-primary-500"
            />
          </label>
          {error && <p className="text-xs text-error-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="rounded-lg bg-primary-500 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveFieldLogo(home.logoDataUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
              {home.title}
            </h1>
          </div>
          <p className="mt-3 max-w-prose whitespace-pre-wrap text-base leading-relaxed text-neutral-600">
            {home.description}
          </p>
        </>
      )}

      {children}
    </div>
  );
}

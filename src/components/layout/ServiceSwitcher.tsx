"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  BUILTIN_SERVICES,
  getCurrentService,
  type StudyService,
} from "@/data/services";
import {
  getFieldHomeSnapshot,
  hydrateFieldHomeFromApi,
  subscribeFieldHome,
} from "@/lib/admin/field-home-store";
import {
  createStudyServiceAsync,
  deleteStudyServiceAsync,
  hydrateStudyServicesFromApi,
} from "@/lib/admin/services-store";
import { useStudyServices } from "@/lib/admin/use-study-services";
import { useFieldHome } from "@/lib/admin/use-field-home";
import { resolveFieldLogo } from "@/lib/brand";
import { isApiMode } from "@/lib/data-mode";
import { fieldFromPathname, normalizeFieldSlug } from "@/lib/field-path";

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function slugShortName(name: string) {
  const ascii = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
  if (ascii.length >= 2) return ascii;
  return name.replace(/[^a-zA-Z가-힣0-9]/g, "").slice(0, 2).toUpperCase() || "FD";
}

/** 분야 홈 변경 시 목록 로고도 다시 그리기 */
let fieldHomeVersion = 0;
function subscribeFieldHomeVersion(onChange: () => void) {
  return subscribeFieldHome(() => {
    fieldHomeVersion += 1;
    onChange();
  });
}
function getFieldHomeVersion() {
  return fieldHomeVersion;
}

function useFieldHomeTick() {
  return useSyncExternalStore(
    subscribeFieldHomeVersion,
    getFieldHomeVersion,
    () => 0,
  );
}

export function ServiceSwitcher() {
  const { session } = useAuth();
  const pathname = usePathname();
  const services = useStudyServices();
  const fieldSlug = fieldFromPathname(pathname);
  const home = useFieldHome(fieldSlug);
  useFieldHomeTick();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isApiMode()) {
      void hydrateStudyServicesFromApi();
      void hydrateFieldHomeFromApi(fieldSlug);
    }
  }, [fieldSlug]);

  useEffect(() => {
    if (!open || !isApiMode()) return;
    for (const s of services) {
      void hydrateFieldHomeFromApi(s.path);
    }
  }, [open, services]);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    getCurrentService(services, pathname) ?? BUILTIN_SERVICES[0];
  const displayName = home.title?.trim() || current.name;
  const autoPath = normalizeFieldSlug(name);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setAdding(false);
        setError(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setAdding(false);
        setError(null);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createStudyServiceAsync({
        name,
        shortName: shortName || slugShortName(name),
        description,
        path: autoPath || name,
      });
      setName("");
      setShortName("");
      setDescription("");
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "추가 실패");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(service: StudyService) {
    if (service.builtin) return;
    if (!confirm(`「${service.name}」분야를 삭제할까요?`)) return;
    try {
      await deleteStudyServiceAsync(service.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="분야 전환"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-lg py-1 pr-1.5 pl-0 text-left transition-colors duration-150 hover:bg-neutral-50"
      >
        <FieldMark src={resolveFieldLogo(home.logoDataUrl)} />
        <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
          <span className="text-sm font-semibold text-neutral-900 sm:text-base">
            {displayName}
          </span>
          <span className="hidden text-sm font-normal text-neutral-400 sm:inline">
            / {current.path}
          </span>
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="학습 분야"
          className="absolute top-full left-0 z-30 mt-2 w-80 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-xs font-medium text-neutral-400">분야 이동</p>
            {session && (
              <button
                type="button"
                onClick={() => {
                  setAdding((v) => !v);
                  setError(null);
                }}
                className="rounded-md px-2 py-0.5 text-xs font-medium text-primary-600 hover:bg-primary-50"
              >
                {adding ? "닫기" : "+ 새 분야"}
              </button>
            )}
          </div>

          {adding && session && (
            <form
              onSubmit={(e) => void onCreate(e)}
              className="mx-2 mb-2 space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3"
            >
              <p className="text-xs font-semibold text-neutral-700">
                새 학습 분야
              </p>
              <div className="flex gap-2">
                <input
                  value={shortName}
                  onChange={(e) =>
                    setShortName(e.target.value.slice(0, 3).toUpperCase())
                  }
                  placeholder="아이콘"
                  maxLength={3}
                  className="h-8 w-14 shrink-0 rounded-md border border-neutral-200 bg-white px-2 text-center text-xs font-bold outline-none focus:border-primary-500"
                  title="아이콘 글자 (최대 3자)"
                />
                <input
                  value={name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setName(v);
                    if (!shortName) setShortName(slugShortName(v));
                  }}
                  placeholder="이름 (예: Vue Lab)"
                  required
                  className="h-8 min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="한 줄 소개 · 키워드"
                className="h-8 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm outline-none focus:border-primary-500"
              />
              <p className="text-[11px] text-neutral-400">
                경로 자동: /{autoPath || "…"}
              </p>
              {error && (
                <p className="text-xs text-error-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={saving || !name.trim() || !autoPath}
                className="h-8 w-full rounded-md bg-primary-500 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? "추가 중…" : "추가하기"}
              </button>
            </form>
          )}

          <ul>
            {services.map((service) => {
              const active =
                service.path === current.path || service.id === current.id;
              const fieldHome = getFieldHomeSnapshot(service.path);
              const label =
                service.path === fieldSlug
                  ? displayName
                  : fieldHome.title || service.name;
              const logoSrc = resolveFieldLogo(fieldHome.logoDataUrl);
              const className = `flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors duration-150 ${
                active ? "bg-primary-50" : "hover:bg-neutral-50"
              }`;

              const body = (
                <>
                  <FieldMark src={logoSrc} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-neutral-900">
                        {label}
                      </span>
                      {active && (
                        <span className="shrink-0 whitespace-nowrap text-[10px] font-medium text-primary-600">
                          현재
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-neutral-500">
                      /{service.path}
                      {service.description ? ` · ${service.description}` : ""}
                    </span>
                  </span>
                  {session && !service.builtin && (
                    <button
                      type="button"
                      title="삭제"
                      aria-label={`${label} 삭제`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void onDelete(service);
                      }}
                      className="mt-0.5 shrink-0 rounded px-1 text-xs text-neutral-300 hover:bg-error-50 hover:text-error-600"
                    >
                      ×
                    </button>
                  )}
                </>
              );

              if (isExternal(service.href)) {
                return (
                  <li key={service.id}>
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                      onClick={() => setOpen(false)}
                    >
                      {body}
                    </a>
                  </li>
                );
              }

              return (
                <li key={service.id}>
                  <Link
                    href={service.href}
                    className={className}
                    onClick={() => setOpen(false)}
                  >
                    {body}
                  </Link>
                </li>
              );
            })}
          </ul>

          {session && !adding && (
            <p className="border-t border-neutral-100 px-3 py-2 text-[11px] text-neutral-400">
              분야 로고는 각 분야 홈의 「홈 정보 수정」에서 바꿀 수 있어요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FieldMark({
  src,
  size = "sm",
}: {
  src: string;
  size?: "sm" | "md";
}) {
  const box = size === "md" ? "h-8 w-8" : "h-7 w-7";
  return (
    <span
      className={`flex ${box} shrink-0 overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-neutral-400 transition-transform duration-150 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

"use client";

import {
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { sidebarSections } from "@/data/navigation";
import { categoryPublicHref } from "@/lib/admin/post-mapper";
import { setSidebarOrder } from "@/lib/admin/sidebar-order";
import { mergeSectionNavItems } from "@/lib/admin/sidebar-nav";
import { useFieldHome } from "@/lib/admin/use-field-home";
import {
  DEFAULT_FIELD,
  fieldFromPathname,
  fieldHome,
} from "@/lib/field-path";
import type { Difficulty } from "@/types/content";
import { slugify } from "@/lib/slugify";

type NavItem = {
  key: string;
  label: string;
  href: string;
  difficulty?: Difficulty;
  postId?: string;
};

export function Sidebar() {
  const pathname = usePathname();
  const field = fieldFromPathname(pathname);
  const { session } = useAuth();
  const { categories, posts, createCategory, reorderPosts, deletePost } =
    useAdminContent();
  const canEdit = Boolean(session);
  const [orderTick, setOrderTick] = useState(0);
  const home = useFieldHome(field);

  useEffect(() => {
    const onChange = () => setOrderTick((n) => n + 1);
    window.addEventListener("rs-sidebar-order-changed", onChange);
    return () =>
      window.removeEventListener("rs-sidebar-order-changed", onChange);
  }, []);

  const customCategories = useMemo(
    () =>
      [...categories]
        .filter(
          (c) =>
            !c.builtin && (c.fieldSlug || DEFAULT_FIELD) === field,
        )
        .sort((a, b) => a.order - b.order),
    [categories, field],
  );
  const publishedPosts = useMemo(
    () =>
      posts
        .filter(
          (p) =>
            p.published && (p.fieldSlug || DEFAULT_FIELD) === field,
        )
        .sort((a, b) => a.order - b.order),
    [posts, field],
  );
  const showSeedNav = field === DEFAULT_FIELD;

  const persistSectionOrder = useCallback(
    async (sectionId: string, items: NavItem[]) => {
      setSidebarOrder(
        sectionId,
        items.map((i) => i.key),
      );
      const postIds = items
        .map((i) => i.postId)
        .filter((id): id is string => Boolean(id));
      if (postIds.length > 0) {
        await reorderPosts(postIds);
      }
      setOrderTick((n) => n + 1);
    },
    [reorderPosts],
  );

  const onDeletePost = useCallback(
    async (postId: string, title: string) => {
      if (!confirm(`「${title}」을(를) 삭제할까요?`)) return;
      try {
        await deletePost(postId);
      } catch (err) {
        alert(err instanceof Error ? err.message : "삭제 실패");
      }
    },
    [deletePost],
  );

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 self-start overflow-x-hidden overflow-y-auto border-r border-neutral-200 bg-white lg:block">
      <div className="flex min-h-full flex-col px-5 pt-4 pb-6">
        <div className="relative mb-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
                목차 · /{field}
              </p>
              <Link
                href={fieldHome(field)}
                className="mt-1 block truncate text-lg font-bold text-neutral-900 hover:text-primary-700"
              >
                {home.title}
              </Link>
              <p className="mt-0.5 line-clamp-2 text-sm text-neutral-500">
                {home.tagline}
              </p>
            </div>
            {canEdit && (
              <CategoryQuickAdd
                fieldSlug={field}
                onCreate={createCategory}
              />
            )}
          </div>
          {canEdit && (
            <p className="mt-3 text-[11px] text-neutral-400">
              글을 드래그해 순서를 바꿀 수 있습니다
            </p>
          )}
        </div>

        <nav aria-label="목차" className="space-y-6">
          {showSeedNav &&
            sidebarSections.map((section) => {
              const sectionActive =
                pathname === section.href ||
                pathname.startsWith(`${section.href}/`);

              const items = mergeSectionNavItems(
                section.id,
                section.items ?? [],
                publishedPosts,
              );
              // orderTick forces re-read of localStorage order
              void orderTick;

              return (
                <div key={section.id}>
                  <Link
                    href={section.href}
                    className={`mb-2 block text-sm font-semibold transition-colors duration-150 ${
                      sectionActive
                        ? "text-primary-700"
                        : "text-neutral-800 hover:text-primary-600"
                    }`}
                  >
                    {section.label}
                  </Link>
                  {items.length > 0 && (
                    <SortableItemList
                      items={items}
                      pathname={pathname}
                      canDrag={canEdit}
                      onReorder={(next) =>
                        void persistSectionOrder(section.id, next)
                      }
                      onDeletePost={canEdit ? onDeletePost : undefined}
                    />
                  )}
                </div>
              );
            })}

          {customCategories.map((cat) => {
            const href = categoryPublicHref(cat.slug, field);
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            const catPosts: NavItem[] = mergeSectionNavItems(
              cat.slug,
              [],
              publishedPosts.filter((p) => p.categorySlug === cat.slug),
            );
            void orderTick;

            return (
              <div key={cat.id}>
                <Link
                  href={href}
                  className={`mb-2 block text-sm font-semibold transition-colors duration-150 ${
                    active
                      ? "text-primary-700"
                      : "text-neutral-800 hover:text-primary-600"
                  }`}
                >
                  {cat.label}
                </Link>
                {catPosts.length > 0 && (
                  <SortableItemList
                    items={catPosts}
                    pathname={pathname}
                    canDrag={canEdit}
                    onReorder={(next) =>
                      void persistSectionOrder(cat.slug, next)
                    }
                    onDeletePost={canEdit ? onDeletePost : undefined}
                  />
                )}
              </div>
            );
          })}

          {!showSeedNav && customCategories.length === 0 && (
            <p className="text-sm text-neutral-400">
              {canEdit
                ? "「+ 카테고리」로 목차를 추가하세요."
                : "아직 카테고리가 없습니다."}
            </p>
          )}
        </nav>

        <div className="mt-auto border-t border-neutral-100 pt-6">
          <p className="text-xs text-neutral-400">프론트엔드 학습용 · v0.1</p>
        </div>
      </div>
    </aside>
  );
}

function CategoryQuickAdd({
  fieldSlug,
  onCreate,
}: {
  fieldSlug: string;
  onCreate: (input: {
    label: string;
    slug: string;
    navLabel?: string;
    description?: string;
    fieldSlug?: string;
  }) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [navLabel, setNavLabel] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nav = navLabel.trim();
    const name = label.trim();
    if (!nav || !name) return;
    setSaving(true);
    setError(null);
    try {
      const slug = slugify(name);
      if (!slug) {
        throw new Error("카테고리명에서 URL용 슬러그를 만들 수 없습니다.");
      }
      await onCreate({
        label: name,
        navLabel: nav,
        slug,
        description: "",
        fieldSlug,
      });
      setNavLabel("");
      setLabel("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "추가 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
        title="카테고리 추가"
        aria-label="카테고리 추가"
      >
        {open ? "닫기" : "+ 카테고리"}
      </button>
      {open && (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="absolute inset-x-0 top-full z-30 mt-2 box-border w-full max-w-full rounded-xl border border-neutral-200 bg-white p-3 shadow-lg"
        >
          <p className="mb-2 text-xs font-semibold text-neutral-700">
            새 카테고리
          </p>
          <label className="mb-2 block space-y-1">
            <span className="text-[11px] font-medium text-neutral-500">
              네비게이션 이름
            </span>
            <input
              autoFocus
              value={navLabel}
              onChange={(e) => setNavLabel(e.target.value)}
              placeholder="예: 서비스"
              required
              className="h-9 w-full min-w-0 rounded-lg border border-neutral-200 px-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <label className="mb-2 block space-y-1">
            <span className="text-[11px] font-medium text-neutral-500">
              카테고리명
            </span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: React 대표 서비스"
              required
              className="h-9 w-full min-w-0 rounded-lg border border-neutral-200 px-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <p className="mb-2 text-[10px] leading-relaxed text-neutral-400">
            네비에는 짧은 이름, 사이드바·페이지에는 카테고리명이 보여요.
          </p>
          {error && (
            <p className="mb-2 text-xs text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !navLabel.trim() || !label.trim()}
              className="rounded-md bg-primary-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? "…" : "추가"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

function SortableItemList({
  items,
  pathname,
  canDrag,
  onReorder,
  onDeletePost,
}: {
  items: NavItem[];
  pathname: string;
  canDrag: boolean;
  onReorder: (next: NavItem[]) => void;
  onDeletePost?: (postId: string, title: string) => void;
}) {
  const [dragLocal, setDragLocal] = useState<NavItem[] | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const display = dragLocal ?? items;

  function onDragStart(e: DragEvent, key: string) {
    if (!canDrag) return;
    setDragLocal(items);
    setDragKey(key);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key);
  }

  function onDragOver(e: DragEvent, overKey: string) {
    if (!canDrag || !dragKey || dragKey === overKey) return;
    e.preventDefault();
    setDragLocal((prev) => {
      const list = prev ?? items;
      const from = list.findIndex((i) => i.key === dragKey);
      const to = list.findIndex((i) => i.key === overKey);
      if (from < 0 || to < 0 || from === to) return list;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function onDragEnd() {
    if (!canDrag || !dragKey) {
      setDragKey(null);
      setDragLocal(null);
      return;
    }
    const next = dragLocal ?? items;
    const same =
      next.length === items.length &&
      next.every((item, i) => item.key === items[i]?.key);
    if (!same) onReorder(next);
    setDragKey(null);
    setDragLocal(null);
  }

  return (
    <ul className="space-y-1 border-l border-neutral-200 pl-3">
      {display.map((item) => {
        const itemPath = item.href.split("#")[0];
        const active = pathname === itemPath || pathname === item.href;
        return (
          <li
            key={item.key}
            draggable={canDrag}
            onDragStart={(e) => onDragStart(e, item.key)}
            onDragOver={(e) => onDragOver(e, item.key)}
            onDragEnd={onDragEnd}
            className={
              dragKey === item.key ? "opacity-50" : undefined
            }
          >
            <div
              className={`group flex min-w-0 items-center gap-1 rounded-md py-1.5 text-sm transition-colors duration-150 ${
                active
                  ? "font-medium text-primary-600"
                  : "text-neutral-600"
              }`}
            >
              {canDrag && (
                <span
                  className="shrink-0 cursor-grab text-[10px] text-neutral-300 group-hover:text-neutral-400 active:cursor-grabbing"
                  aria-hidden
                >
                  ⠿
                </span>
              )}
              <Link
                href={item.href}
                className={`min-w-0 flex-1 truncate hover:text-primary-600 ${
                  canDrag ? "cursor-grab active:cursor-grabbing" : ""
                }`}
                onClick={(e) => {
                  if (dragKey) {
                    e.preventDefault();
                    return;
                  }
                  const [path, hash] = item.href.split("#");
                  if (hash && path === pathname) {
                    e.preventDefault();
                    const el = document.getElementById(hash);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      window.history.replaceState(null, "", `${path}#${hash}`);
                    }
                  }
                }}
              >
                {item.label}
              </Link>
              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                {item.difficulty && (
                  <DifficultyBadge level={item.difficulty} />
                )}
                {onDeletePost && (
                  <span className="flex w-5 justify-center">
                    {item.postId ? (
                      <button
                        type="button"
                        title="삭제"
                        aria-label={`${item.label} 삭제`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeletePost(item.postId!, item.label);
                        }}
                        className="rounded px-0.5 text-xs leading-none text-neutral-300 opacity-0 transition hover:bg-error-50 hover:text-error-600 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    ) : null}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

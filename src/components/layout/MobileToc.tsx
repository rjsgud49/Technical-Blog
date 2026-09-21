"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { sidebarSections } from "@/data/navigation";
import {
  DEFAULT_FIELD,
  fieldFromPathname,
} from "@/lib/field-path";
import { categoryPublicHref } from "@/lib/admin/post-mapper";
import { mergeSectionNavItems } from "@/lib/admin/sidebar-nav";

export function MobileToc() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { categories, posts } = useAdminContent();
  const field = fieldFromPathname(pathname);

  const sections = useMemo(() => {
    const published = posts
      .filter(
        (p) =>
          p.published && (p.fieldSlug || DEFAULT_FIELD) === field,
      )
      .sort((a, b) => a.order - b.order);

    const builtin =
      field === DEFAULT_FIELD
        ? sidebarSections.map((section) => ({
            id: section.id,
            label: section.label,
            href: section.href,
            items: mergeSectionNavItems(
              section.id,
              section.items ?? [],
              published,
            ),
          }))
        : [];

    const custom = categories
      .filter(
        (c) =>
          !c.builtin && (c.fieldSlug || DEFAULT_FIELD) === field,
      )
      .sort((a, b) => a.order - b.order)
      .map((cat) => ({
        id: cat.slug,
        label: cat.label,
        href: categoryPublicHref(cat.slug, field),
        items: mergeSectionNavItems(
          cat.slug,
          [],
          published.filter((p) => p.categorySlug === cat.slug),
        ),
      }));

    return [...builtin, ...custom];
  }, [categories, posts, field]);

  return (
    <div className="mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-xs"
      >
        목차 보기
        <span className="text-neutral-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <nav className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <ul className="space-y-4">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  href={section.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-semibold ${
                    pathname === section.href ||
                    pathname.startsWith(`${section.href}/`)
                      ? "text-primary-700"
                      : "text-neutral-800"
                  }`}
                >
                  {section.label}
                </Link>
                {section.items.length > 0 && (
                  <ul className="mt-1.5 space-y-1 pl-3">
                    {section.items.map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            const [path, hash] = item.href.split("#");
                            if (hash && path === pathname) {
                              e.preventDefault();
                              document
                                .getElementById(hash)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              window.history.replaceState(
                                null,
                                "",
                                `${path}#${hash}`,
                              );
                            }
                            setOpen(false);
                          }}
                          className="flex min-w-0 items-center justify-between gap-2 py-1 text-sm text-neutral-600 hover:text-primary-600"
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {item.difficulty && (
                            <DifficultyBadge level={item.difficulty} />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

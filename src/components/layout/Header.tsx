"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ServiceSwitcher } from "@/components/layout/ServiceSwitcher";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminContent } from "@/components/admin/AdminContentProvider";
import { topNav } from "@/data/navigation";
import { categoryPublicHref } from "@/lib/admin/post-mapper";
import {
  DEFAULT_FIELD,
  fieldFromPathname,
} from "@/lib/field-path";

type NavItem = { label: string; href: string };

export function Header() {
  const pathname = usePathname();
  const { session, loading, logout } = useAuth();
  const { categories } = useAdminContent();
  const field = fieldFromPathname(pathname);

  const nav = useMemo(() => {
    const seedBySlug = new Map(
      topNav.map((item) => {
        const slug = item.href.split("/").filter(Boolean).pop() ?? "";
        return [slug, item] as const;
      }),
    );

    return [...categories]
      .filter((c) => (c.fieldSlug || DEFAULT_FIELD) === field)
      .sort((a, b) => a.order - b.order)
      .flatMap((c) => {
        const seed = field === DEFAULT_FIELD ? seedBySlug.get(c.slug) : undefined;
        if (seed) {
          return [{ label: seed.label, href: seed.href }];
        }
        const navLabel = c.navLabel?.trim();
        if (!navLabel) return [];
        return [
          {
            label: navLabel,
            href: categoryPublicHref(c.slug, field),
          },
        ];
      });
  }, [categories, field]);

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <ServiceSwitcher />

        <nav className="flex items-center gap-1 overflow-x-auto sm:gap-2">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 sm:px-3 ${
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {!loading &&
            (session ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 sm:px-3"
                title={session.user.displayName}
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 sm:px-3"
              >
                로그인
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}

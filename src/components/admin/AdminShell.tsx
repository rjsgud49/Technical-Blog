"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";

const nav: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin/categories", label: "카테고리" },
  { href: "/admin/posts", label: "글 목록" },
  { href: "/admin", label: "대시보드", exact: true },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { session, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, session, router, pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-full items-center justify-center bg-neutral-50 text-sm text-neutral-500">
        인증 확인 중…
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-bold text-neutral-900"
            >
              Admin
            </Link>
            <nav className="flex items-center gap-1">
              {nav.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-neutral-500 sm:inline">
              {session.user.displayName}
            </span>
            <Link
              href={fieldHome(DEFAULT_FIELD)}
              className="rounded-lg px-3 py-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              사이트로
            </Link>
            <button
              type="button"
              onClick={() => void logout().then(() => router.push("/login"))}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-800"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}

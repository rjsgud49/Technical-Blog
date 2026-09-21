"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DEFAULT_FIELD, fieldHome } from "@/lib/field-path";

export function LoginForm() {
  const { login, session, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || fieldHome(DEFAULT_FIELD);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace(next);
    }
  }, [loading, session, router, next]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({
        username: username.trim().toLowerCase(),
        password,
      });
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900">관리자 로그인</h1>
        <p className="mt-2 text-sm text-neutral-500">
          글·카테고리를 작성·수정하려면 서버 인증 후 로그인하세요.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4" autoComplete="on">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">이메일</span>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="you@example.com"
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">
              비밀번호
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              minLength={8}
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              required
            />
          </label>

          {error && (
            <p className="text-sm text-error-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-primary-500 text-sm font-medium text-white shadow-xs transition hover:bg-primary-600 disabled:opacity-60"
          >
            {submitting ? "로그인 중…" : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link
            href={fieldHome(DEFAULT_FIELD)}
            className="text-primary-600 hover:underline"
          >
            ← 사이트로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

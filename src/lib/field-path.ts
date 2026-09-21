/** 학습 분야 URL 접두사 (예: react → /react/hooks) */

export const DEFAULT_FIELD = "react";

/** Next 앱·시스템 경로와 충돌하는 slug */
export const RESERVED_FIELD_SLUGS = new Set([
  "admin",
  "login",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isReservedFieldSlug(slug: string) {
  return RESERVED_FIELD_SLUGS.has(slug.toLowerCase());
}

export function normalizeFieldSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function fieldHome(fieldSlug = DEFAULT_FIELD) {
  return `/${fieldSlug}`;
}

/**
 * 분야 기준 경로 생성.
 * @example fieldPath("react", "/hooks") → "/react/hooks"
 * @example fieldPath("react", "/history#origin") → "/react/history#origin"
 */
export function fieldPath(fieldSlug: string, path = "") {
  const base = `/${fieldSlug || DEFAULT_FIELD}`;
  if (!path || path === "/") return base;
  if (/^https?:\/\//i.test(path)) return path;

  const [pathname, hash] = path.split("#");
  let p = pathname || "";
  if (!p.startsWith("/")) p = `/${p}`;
  // 이미 /react/... 형태면 그대로
  if (p === base || p.startsWith(`${base}/`)) {
    return hash ? `${p}#${hash}` : p;
  }
  const full = `${base}${p}`;
  return hash ? `${full}#${hash}` : full;
}

/** pathname 첫 세그먼트에서 분야 slug 추출 */
export function fieldFromPathname(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg || isReservedFieldSlug(seg)) return DEFAULT_FIELD;
  return seg;
}

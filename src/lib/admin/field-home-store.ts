import { siteConfig } from "@/data/navigation";
import { listStudyServices } from "@/lib/admin/services-store";
import { apiFetch } from "@/lib/api/client";
import { DEFAULT_FIELD } from "@/lib/field-path";

export interface FieldHomeInfo {
  fieldSlug: string;
  /** 홈·사이드바 제목 */
  title: string;
  /** 홈 소개 본문 */
  description: string;
  /** 사이드바 한 줄 */
  tagline: string;
  /** 분야 로고 (data URL). null이면 사이트 기본 로고 */
  logoDataUrl: string | null;
}

const snapshotByField = new Map<string, FieldHomeInfo>();

function defaultHome(fieldSlug: string): FieldHomeInfo {
  if (fieldSlug === DEFAULT_FIELD) {
    return {
      fieldSlug,
      title: siteConfig.name,
      description: `${siteConfig.description}. 왼쪽 목차에서 주제를 고르거나, 아래 목록에서 난이도 태그(상 · 중 · 하)를 확인하며 학습 경로를 잡으세요. 본문의 파란 용어를 누르면 단어사전으로 이동합니다.`,
      tagline: siteConfig.tagline,
      logoDataUrl: null,
    };
  }
  const service =
    typeof window !== "undefined"
      ? listStudyServices().find((s) => s.path === fieldSlug)
      : undefined;
  return {
    fieldSlug,
    title: service?.name ?? fieldSlug,
    description:
      service?.description ||
      "카테고리와 글을 추가해 학습 공간을 채워 보세요.",
    tagline: "카테고리를 추가해 학습 목차를 만드세요",
    logoDataUrl: null,
  };
}

function normalizeHome(
  fieldSlug: string,
  saved: Partial<FieldHomeInfo> | undefined,
): FieldHomeInfo {
  const base = defaultHome(fieldSlug);
  if (!saved) return base;
  return {
    fieldSlug,
    title: saved.title || base.title,
    description: saved.description ?? base.description,
    tagline: saved.tagline ?? base.tagline,
    logoDataUrl:
      typeof saved.logoDataUrl === "string" && saved.logoDataUrl
        ? saved.logoDataUrl
        : null,
  };
}

export function getFieldHomeSnapshot(fieldSlug: string): FieldHomeInfo {
  const existing = snapshotByField.get(fieldSlug);
  if (existing) return existing;
  const next = defaultHome(fieldSlug);
  snapshotByField.set(fieldSlug, next);
  return next;
}

const serverSnapshots = new Map<string, FieldHomeInfo>();

export function getFieldHomeServerSnapshot(fieldSlug: string): FieldHomeInfo {
  const cached = serverSnapshots.get(fieldSlug);
  if (cached) return cached;
  const next = defaultHome(fieldSlug);
  serverSnapshots.set(fieldSlug, next);
  return next;
}

export function subscribeFieldHome(onChange: () => void) {
  window.addEventListener("rs-field-home-changed", onChange);
  return () => window.removeEventListener("rs-field-home-changed", onChange);
}

export type FieldHomeUpdateInput = Partial<
  Pick<FieldHomeInfo, "title" | "description" | "tagline" | "logoDataUrl">
>;

export async function updateFieldHomeAsync(
  fieldSlug: string,
  input: FieldHomeUpdateInput,
): Promise<FieldHomeInfo> {
  const updated = await apiFetch<FieldHomeInfo>(`/field-homes/${fieldSlug}`, {
    method: "PUT",
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      tagline: input.tagline,
      logoDataUrl: input.logoDataUrl,
    }),
  });
  const normalized = normalizeHome(fieldSlug, updated);
  snapshotByField.set(fieldSlug, normalized);
  window.dispatchEvent(new Event("rs-field-home-changed"));
  return normalized;
}

export async function hydrateFieldHomeFromApi(fieldSlug: string) {
  if (typeof window === "undefined") return;
  const data = await apiFetch<FieldHomeInfo>(`/field-homes/${fieldSlug}`);
  const normalized = normalizeHome(fieldSlug, data);
  snapshotByField.set(fieldSlug, normalized);
  window.dispatchEvent(new Event("rs-field-home-changed"));
}

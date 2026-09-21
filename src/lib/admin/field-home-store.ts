import { siteConfig } from "@/data/navigation";
import { listStudyServices } from "@/lib/admin/services-store";
import { apiFetch } from "@/lib/api/client";
import { isApiMode } from "@/lib/data-mode";
import { DEFAULT_FIELD } from "@/lib/field-path";

const STORAGE_KEY = "rs.field.home.v1";

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

type StoreMap = Record<string, FieldHomeInfo>;

let cachedMap: StoreMap | null = null;
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

function readMap(): StoreMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoreMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: StoreMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  cachedMap = map;
  snapshotByField.clear();
  window.dispatchEvent(new Event("rs-field-home-changed"));
}

function ensureCache(): StoreMap {
  if (typeof window === "undefined") return {};
  if (!cachedMap) cachedMap = readMap();
  return cachedMap;
}

function buildHome(fieldSlug: string): FieldHomeInfo {
  return normalizeHome(fieldSlug, ensureCache()[fieldSlug]);
}

export function getFieldHome(fieldSlug: string): FieldHomeInfo {
  return getFieldHomeSnapshot(fieldSlug);
}

/** useSyncExternalStore용 — 동일 참조 유지 */
export function getFieldHomeSnapshot(fieldSlug: string): FieldHomeInfo {
  const existing = snapshotByField.get(fieldSlug);
  if (existing) return existing;
  const next = buildHome(fieldSlug);
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
  const handler = () => {
    if (!isApiMode()) {
      cachedMap = null;
      snapshotByField.clear();
    }
    onChange();
  };
  window.addEventListener("rs-field-home-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("rs-field-home-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

export type FieldHomeUpdateInput = Partial<
  Pick<FieldHomeInfo, "title" | "description" | "tagline" | "logoDataUrl">
>;

export function updateFieldHome(
  fieldSlug: string,
  input: FieldHomeUpdateInput,
): FieldHomeInfo {
  if (isApiMode()) {
    throw new Error("API 모드에서는 updateFieldHomeAsync를 사용하세요.");
  }
  const current = buildHome(fieldSlug);
  const next: FieldHomeInfo = {
    fieldSlug,
    title: input.title?.trim() || current.title,
    description:
      input.description !== undefined
        ? input.description.trim()
        : current.description,
    tagline:
      input.tagline !== undefined ? input.tagline.trim() : current.tagline,
    logoDataUrl:
      input.logoDataUrl !== undefined
        ? input.logoDataUrl || null
        : current.logoDataUrl,
  };
  if (!next.title) throw new Error("제목을 입력하세요.");
  const map = { ...ensureCache(), [fieldSlug]: next };
  writeMap(map);
  snapshotByField.set(fieldSlug, next);
  return next;
}

export async function updateFieldHomeAsync(
  fieldSlug: string,
  input: FieldHomeUpdateInput,
): Promise<FieldHomeInfo> {
  if (!isApiMode()) {
    return updateFieldHome(fieldSlug, input);
  }
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
  if (!isApiMode() || typeof window === "undefined") return;
  const data = await apiFetch<FieldHomeInfo>(`/field-homes/${fieldSlug}`);
  const normalized = normalizeHome(fieldSlug, data);
  snapshotByField.set(fieldSlug, normalized);
  window.dispatchEvent(new Event("rs-field-home-changed"));
}

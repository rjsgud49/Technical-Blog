import type {
  CreateStudyServiceInput,
  StudyService,
} from "@/data/services";
import { BUILTIN_SERVICES } from "@/data/services";
import {
  fieldHome,
  isReservedFieldSlug,
  normalizeFieldSlug,
} from "@/lib/field-path";
import { apiFetch } from "@/lib/api/client";
import { isApiMode } from "@/lib/data-mode";

const STORAGE_KEY = "rs.study.services.v1";

function uid() {
  return `svc_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function slugShortName(name: string, fallback = "FD") {
  const letters = name
    .replace(/[^a-zA-Z가-힣0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
  if (letters.length >= 2) return letters;
  if (letters.length === 1) return `${letters}X`;
  const ascii = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
  return ascii || fallback;
}

function migrateService(s: StudyService): StudyService {
  const path =
    s.path ||
    (s.href?.startsWith("/")
      ? s.href.replace(/^\//, "").split("/")[0]
      : "") ||
    normalizeFieldSlug(s.name);
  return {
    ...s,
    path,
    href: fieldHome(path),
    builtin: false,
    current: false,
  };
}

function readCustom(): StudyService[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudyService[];
    return Array.isArray(parsed) ? parsed.map(migrateService) : [];
  } catch {
    return [];
  }
}

function writeCustom(list: StudyService[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  cachedSnapshot = null;
  window.dispatchEvent(new Event("rs-services-changed"));
}

let cachedSnapshot: StudyService[] | null = null;

function buildSnapshot(): StudyService[] {
  const custom = readCustom();
  const customPaths = new Set(custom.map((s) => s.path));
  const builtins = BUILTIN_SERVICES.filter((s) => !customPaths.has(s.path));
  return [...builtins, ...custom];
}

export function listStudyServices(): StudyService[] {
  if (typeof window === "undefined") return BUILTIN_SERVICES;
  if (isApiMode()) {
    return cachedSnapshot ?? BUILTIN_SERVICES;
  }
  if (!cachedSnapshot) cachedSnapshot = buildSnapshot();
  return cachedSnapshot;
}

/** useSyncExternalStore용 — 동일 참조 유지 */
export function getStudyServicesSnapshot(): StudyService[] {
  return listStudyServices();
}

export function getStudyServicesServerSnapshot(): StudyService[] {
  return BUILTIN_SERVICES;
}

export function subscribeStudyServices(onChange: () => void) {
  const handler = () => {
    // API hydrate는 cachedSnapshot을 직접 채우므로 비우지 않음
    if (!isApiMode()) cachedSnapshot = null;
    onChange();
  };
  window.addEventListener("rs-services-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("rs-services-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

export function createStudyService(
  input: CreateStudyServiceInput,
): StudyService {
  if (isApiMode()) {
    throw new Error("API 모드에서는 createStudyServiceAsync를 사용하세요.");
  }
  const name = input.name.trim();
  if (!name) throw new Error("분야 이름을 입력하세요.");

  const path = normalizeFieldSlug(input.path || name);
  if (!path) throw new Error("경로(path)를 입력하세요. 예: vue, typescript");
  if (isReservedFieldSlug(path)) {
    throw new Error(`「${path}」는 사용할 수 없는 경로입니다.`);
  }
  if (path === "react") {
    throw new Error("react 경로는 이미 rjsgud study가 사용 중입니다.");
  }

  const shortName = (input.shortName?.trim() || slugShortName(name)).slice(
    0,
    3,
  );
  const description = input.description?.trim() ?? "";
  const href = fieldHome(path);

  const existing = listStudyServices();
  if (existing.some((s) => s.path === path)) {
    throw new Error("이미 같은 경로의 분야가 있습니다.");
  }
  if (existing.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("이미 같은 이름의 분야가 있습니다.");
  }

  const list = readCustom();
  const service: StudyService = {
    id: uid(),
    name,
    shortName: shortName || "FD",
    description,
    path,
    href,
    comingSoon: false,
    builtin: false,
  };
  list.push(service);
  writeCustom(list);
  return service;
}

export async function createStudyServiceAsync(
  input: CreateStudyServiceInput,
): Promise<StudyService> {
  if (!isApiMode()) {
    return createStudyService(input);
  }
  const created = await apiFetch<StudyService>("/services", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      shortName: input.shortName,
      description: input.description,
      path: input.path,
    }),
  });
  await hydrateStudyServicesFromApi();
  return created;
}

export function deleteStudyService(id: string) {
  if (isApiMode()) {
    throw new Error("API 모드에서는 deleteStudyServiceAsync를 사용하세요.");
  }
  const builtin = BUILTIN_SERVICES.some((s) => s.id === id);
  if (builtin) throw new Error("내장 분야는 삭제할 수 없습니다.");
  const next = readCustom().filter((s) => s.id !== id);
  writeCustom(next);
}

export async function deleteStudyServiceAsync(id: string) {
  if (!isApiMode()) {
    deleteStudyService(id);
    return;
  }
  await apiFetch<void>(`/services/${id}`, { method: "DELETE" });
  await hydrateStudyServicesFromApi();
}

/** API 모드에서 목록을 서버와 동기화 */
export async function hydrateStudyServicesFromApi() {
  if (!isApiMode() || typeof window === "undefined") return;
  const list = await apiFetch<StudyService[]>("/services");
  cachedSnapshot = list.map((s) => ({
    ...s,
    href: s.href || fieldHome(s.path),
  }));
  window.dispatchEvent(new Event("rs-services-changed"));
}

export function updateStudyService(
  id: string,
  input: Partial<CreateStudyServiceInput>,
): StudyService {
  const list = readCustom();
  const index = list.findIndex((s) => s.id === id);
  if (index < 0) throw new Error("직접 추가한 분야만 수정할 수 있습니다.");
  const current = list[index];
  const path = input.path
    ? normalizeFieldSlug(input.path)
    : current.path;
  if (path && isReservedFieldSlug(path)) {
    throw new Error(`「${path}」는 사용할 수 없는 경로입니다.`);
  }
  list[index] = {
    ...current,
    name: input.name?.trim() ?? current.name,
    shortName: (input.shortName?.trim() || current.shortName).slice(0, 3),
    description:
      input.description !== undefined
        ? input.description.trim()
        : current.description,
    path: path || current.path,
    href: fieldHome(path || current.path),
    comingSoon: input.comingSoon ?? current.comingSoon,
    builtin: false,
    current: false,
  };
  writeCustom(list);
  return list[index];
}

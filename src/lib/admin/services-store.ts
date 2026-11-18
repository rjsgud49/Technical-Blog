import type {
  CreateStudyServiceInput,
  StudyService,
} from "@/data/services";
import { BUILTIN_SERVICES } from "@/data/services";
import { fieldHome } from "@/lib/field-path";
import { apiFetch } from "@/lib/api/client";

// 서버 응답 전까지는 기본 분야만 보여 준다
let cachedSnapshot: StudyService[] = BUILTIN_SERVICES;

export function listStudyServices(): StudyService[] {
  return cachedSnapshot;
}

/** useSyncExternalStore용 — 동일 참조 유지 */
export function getStudyServicesSnapshot(): StudyService[] {
  return cachedSnapshot;
}

export function getStudyServicesServerSnapshot(): StudyService[] {
  return BUILTIN_SERVICES;
}

export function subscribeStudyServices(onChange: () => void) {
  window.addEventListener("rs-services-changed", onChange);
  return () => window.removeEventListener("rs-services-changed", onChange);
}

export async function createStudyServiceAsync(
  input: CreateStudyServiceInput,
): Promise<StudyService> {
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

export async function deleteStudyServiceAsync(id: string) {
  await apiFetch<void>(`/services/${id}`, { method: "DELETE" });
  await hydrateStudyServicesFromApi();
}

/** 목록을 서버와 동기화 */
export async function hydrateStudyServicesFromApi() {
  if (typeof window === "undefined") return;
  const list = await apiFetch<StudyService[]>("/services");
  cachedSnapshot = list.map((s) => ({
    ...s,
    href: s.href || fieldHome(s.path),
  }));
  window.dispatchEvent(new Event("rs-services-changed"));
}

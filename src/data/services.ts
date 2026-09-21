/**
 * 학습 분야 목록.
 * 시드 + localStorage 커스텀 항목을 합쳐 사용합니다.
 */
export interface StudyService {
  id: string;
  name: string;
  shortName: string;
  description: string;
  /** URL 경로 slug — /{path} 로 진입 (예: react → /react) */
  path: string;
  /** 내부 경로 또는 외부 URL (보통 /{path}) */
  href: string;
  /** 현재 이 앱에서 활성인 분야 (시드용; 실제 현재는 pathname으로 판별) */
  current?: boolean;
  comingSoon?: boolean;
  builtin?: boolean;
}

export interface CreateStudyServiceInput {
  name: string;
  shortName?: string;
  description?: string;
  /** 필수: 라우트 slug (예: vue, typescript) */
  path: string;
  href?: string;
  comingSoon?: boolean;
}

export const BUILTIN_SERVICES: StudyService[] = [
  {
    id: "react",
    name: "rjsgud study",
    shortName: "RJ",
    description: "React 역사 · 구조 · 훅 · 패턴",
    path: "react",
    href: "/react",
    current: true,
    builtin: true,
  },
];

export const studyServices = BUILTIN_SERVICES;

export function getCurrentService(
  list: StudyService[] = BUILTIN_SERVICES,
  pathname?: string,
) {
  if (pathname) {
    const seg = pathname.split("/").filter(Boolean)[0];
    if (seg) {
      const byPath = list.find(
        (s) => s.path === seg || s.href === `/${seg}` || s.href.startsWith(`/${seg}/`),
      );
      if (byPath) return byPath;
    }
  }
  return list.find((s) => s.current) ?? list[0];
}

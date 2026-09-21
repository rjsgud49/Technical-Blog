/**
 * 기술 스택 아이콘 카탈로그.
 * id만으로 <TechIcon id="react" /> 처럼 가져다 쓰면 됩니다.
 * 새 기술 추가: 아래 배열에 한 줄 추가 → CDN에서 아이콘을 자동으로 가져옵니다.
 *
 * provider
 * - simpleicons: https://cdn.simpleicons.org/{slug}
 * - devicon:     https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{slug}.svg
 */

import { DEFAULT_FIELD, fieldPath } from "@/lib/field-path";

export type TechIconProvider = "simpleicons" | "devicon";

export interface TechStackItem {
  id: string;
  name: string;
  /** CDN 슬러그 (provider별 규칙 참고) */
  slug: string;
  provider: TechIconProvider;
  /** simpleicons 브랜드 컬러 (hex, # 없이). 생략 시 기본 색 */
  color?: string;
  category: "core" | "language" | "styling" | "tooling" | "state" | "other";
  /** 사이트 내 관련 문서 */
  href?: string;
  description?: string;
}

export const techStackCatalog: TechStackItem[] = [
  {
    id: "react",
    name: "React",
    slug: "react",
    provider: "simpleicons",
    color: "61DAFB",
    category: "core",
    href: fieldPath(DEFAULT_FIELD, "/history"),
    description: "UI 라이브러리",
  },
  {
    id: "nextjs",
    name: "Next.js",
    slug: "nextdotjs",
    provider: "simpleicons",
    color: "000000",
    category: "core",
    description: "React 프레임워크",
  },
  {
    id: "typescript",
    name: "TypeScript",
    slug: "typescript",
    provider: "simpleicons",
    color: "3178C6",
    category: "language",
    description: "정적 타입",
  },
  {
    id: "javascript",
    name: "JavaScript",
    slug: "javascript",
    provider: "simpleicons",
    color: "F7DF1E",
    category: "language",
    description: "언어 기반",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    slug: "tailwindcss",
    provider: "simpleicons",
    color: "06B6D4",
    category: "styling",
    description: "유틸리티 CSS",
  },
  {
    id: "css3",
    name: "CSS3",
    slug: "css3/css3-original",
    provider: "devicon",
    category: "styling",
    description: "스타일시트",
  },
  {
    id: "html5",
    name: "HTML5",
    slug: "html5/html5-original",
    provider: "devicon",
    category: "language",
    description: "마크업",
  },
  {
    id: "nodejs",
    name: "Node.js",
    slug: "nodedotjs",
    provider: "simpleicons",
    color: "339933",
    category: "tooling",
    description: "런타임",
  },
  {
    id: "npm",
    name: "npm",
    slug: "npm",
    provider: "simpleicons",
    color: "CB3837",
    category: "tooling",
    description: "패키지 매니저",
  },
  {
    id: "git",
    name: "Git",
    slug: "git",
    provider: "simpleicons",
    color: "F05032",
    category: "tooling",
    description: "버전 관리",
  },
  {
    id: "github",
    name: "GitHub",
    slug: "github",
    provider: "simpleicons",
    color: "181717",
    category: "tooling",
    description: "코드 호스팅",
  },
  {
    id: "vite",
    name: "Vite",
    slug: "vite",
    provider: "simpleicons",
    color: "646CFF",
    category: "tooling",
    description: "빌드 도구",
  },
  {
    id: "eslint",
    name: "ESLint",
    slug: "eslint",
    provider: "simpleicons",
    color: "4B32C3",
    category: "tooling",
    description: "린터",
  },
  {
    id: "prettier",
    name: "Prettier",
    slug: "prettier",
    provider: "simpleicons",
    color: "F7B93E",
    category: "tooling",
    description: "포매터",
  },
  {
    id: "jest",
    name: "Jest",
    slug: "jest",
    provider: "simpleicons",
    color: "C21325",
    category: "tooling",
    description: "테스트",
  },
  {
    id: "vitest",
    name: "Vitest",
    slug: "vitest",
    provider: "simpleicons",
    color: "6E9F18",
    category: "tooling",
    description: "테스트",
  },
  {
    id: "redux",
    name: "Redux",
    slug: "redux",
    provider: "simpleicons",
    color: "764ABC",
    category: "state",
    description: "상태 관리",
  },
  {
    id: "zustand",
    name: "Zustand",
    slug: "zustand",
    // simpleicons에 없을 수 있어 devicon/local fallback 대신 유사 아이콘
    provider: "simpleicons",
    color: "443E38",
    category: "state",
    description: "경량 상태",
  },
  {
    id: "reactquery",
    name: "TanStack Query",
    slug: "reactquery",
    provider: "simpleicons",
    color: "FF4154",
    category: "state",
    description: "서버 상태",
  },
  {
    id: "graphql",
    name: "GraphQL",
    slug: "graphql",
    provider: "simpleicons",
    color: "E10098",
    category: "other",
    description: "API 쿼리",
  },
  {
    id: "storybook",
    name: "Storybook",
    slug: "storybook",
    provider: "simpleicons",
    color: "FF4785",
    category: "tooling",
    description: "UI 문서화",
  },
  {
    id: "figma",
    name: "Figma",
    slug: "figma",
    provider: "simpleicons",
    color: "F24E1E",
    category: "other",
    description: "디자인",
  },
  {
    id: "vercel",
    name: "Vercel",
    slug: "vercel",
    provider: "simpleicons",
    color: "000000",
    category: "tooling",
    description: "배포",
  },
  {
    id: "docker",
    name: "Docker",
    slug: "docker",
    provider: "simpleicons",
    color: "2496ED",
    category: "other",
    description: "컨테이너",
  },
];

const byId = new Map(techStackCatalog.map((item) => [item.id, item]));

export function getTechStackItem(id: string): TechStackItem | undefined {
  return byId.get(id);
}

export function listTechStack(category?: TechStackItem["category"]) {
  if (!category) return techStackCatalog;
  return techStackCatalog.filter((item) => item.category === category);
}

/** CDN URL — img src / background-image 등에 그대로 사용 */
export function getTechIconUrl(id: string): string | null {
  const item = byId.get(id);
  if (!item) return null;
  return resolveTechIconUrl(item);
}

export function resolveTechIconUrl(item: TechStackItem): string {
  if (item.provider === "devicon") {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${item.slug}.svg`;
  }
  const color = item.color ? `/${item.color}` : "";
  return `https://cdn.simpleicons.org/${item.slug}${color}`;
}

export const techCategoryLabel: Record<TechStackItem["category"], string> = {
  core: "코어",
  language: "언어",
  styling: "스타일",
  tooling: "도구",
  state: "상태",
  other: "기타",
};

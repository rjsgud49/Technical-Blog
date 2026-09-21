import type { NavSection } from "@/types/content";
import { DEFAULT_FIELD, fieldHome, fieldPath } from "@/lib/field-path";

export const siteConfig = {
  name: "rjsgud study",
  shortName: "RJ",
  description: "React 역사부터 구조·훅·패턴까지 심화 학습",
  tagline: "상 · 중 · 하로 쌓아 올리는 React",
};

const F = DEFAULT_FIELD;

export const topNav = [
  { label: "역사", href: fieldPath(F, "/history") },
  { label: "구조", href: fieldPath(F, "/structure") },
  { label: "훅", href: fieldPath(F, "/hooks") },
  { label: "패턴", href: fieldPath(F, "/patterns") },
  { label: "사전", href: fieldPath(F, "/glossary") },
] as const;

/** UI 네비게이션만 유지. 본문·목록 데이터는 ContentRepository를 사용하세요. */
export const sidebarSections: NavSection[] = [
  {
    id: "history",
    label: "React 역사",
    href: fieldPath(F, "/history"),
    items: [
      { label: "탄생과 배경", href: fieldPath(F, "/history#origin"), difficulty: "basic" },
      { label: "주요 버전 흐름", href: fieldPath(F, "/history#versions"), difficulty: "basic" },
      { label: "현대 React의 방향", href: fieldPath(F, "/history#modern"), difficulty: "intermediate" },
    ],
  },
  {
    id: "structure",
    label: "React 구조",
    href: fieldPath(F, "/structure"),
    items: [
      { label: "컴포넌트와 JSX", href: fieldPath(F, "/structure#jsx"), difficulty: "basic" },
      { label: "렌더링 모델", href: fieldPath(F, "/structure#rendering"), difficulty: "intermediate" },
      { label: "Virtual DOM & Fiber", href: fieldPath(F, "/structure#fiber"), difficulty: "advanced" },
      { label: "상태와 데이터 흐름", href: fieldPath(F, "/structure#data-flow"), difficulty: "intermediate" },
    ],
  },
  {
    id: "hooks",
    label: "Hooks",
    href: fieldPath(F, "/hooks"),
    items: [
      { label: "useState", href: fieldPath(F, "/hooks#use-state"), difficulty: "basic" },
      { label: "useEffect", href: fieldPath(F, "/hooks#use-effect"), difficulty: "basic" },
      { label: "useRef", href: fieldPath(F, "/hooks#use-ref"), difficulty: "basic" },
      { label: "useMemo / useCallback", href: fieldPath(F, "/hooks#use-memo"), difficulty: "intermediate" },
      { label: "useContext", href: fieldPath(F, "/hooks#use-context"), difficulty: "intermediate" },
      { label: "useReducer", href: fieldPath(F, "/hooks#use-reducer"), difficulty: "intermediate" },
      { label: "커스텀 훅", href: fieldPath(F, "/hooks#custom-hooks"), difficulty: "advanced" },
    ],
  },
  {
    id: "patterns",
    label: "패턴",
    href: fieldPath(F, "/patterns"),
    items: [
      { label: "Compound Components", href: fieldPath(F, "/patterns#compound"), difficulty: "intermediate" },
      { label: "Render Props", href: fieldPath(F, "/patterns#render-props"), difficulty: "intermediate" },
      { label: "HOC", href: fieldPath(F, "/patterns#hoc"), difficulty: "intermediate" },
      { label: "Controlled / Uncontrolled", href: fieldPath(F, "/patterns#controlled"), difficulty: "basic" },
      { label: "State Colocation", href: fieldPath(F, "/patterns#colocation"), difficulty: "advanced" },
      { label: "Container / Presentational", href: fieldPath(F, "/patterns#container"), difficulty: "basic" },
    ],
  },
  {
    id: "glossary",
    label: "단어사전",
    href: fieldPath(F, "/glossary"),
    items: [
      { label: "Component", href: fieldPath(F, "/glossary#component"), difficulty: "basic" },
      { label: "Props", href: fieldPath(F, "/glossary#props"), difficulty: "basic" },
      { label: "State", href: fieldPath(F, "/glossary#state"), difficulty: "basic" },
      { label: "Hooks", href: fieldPath(F, "/glossary#hooks"), difficulty: "basic" },
      { label: "useState", href: fieldPath(F, "/glossary#usestate"), difficulty: "basic" },
      { label: "전체 용어 보기", href: fieldPath(F, "/glossary") },
    ],
  },
];

export const reactHome = fieldHome(F);

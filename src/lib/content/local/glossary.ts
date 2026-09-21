import type { GlossaryTerm } from "@/types/lesson";
import { info, p, term, tip, ul, warn } from "@/lib/content/helpers";

/**
 * 단어사전 — 본문의 term("slug") 와 slug가 반드시 일치해야 합니다.
 * DB 도입 시 glossary 테이블과 동일한 스키마로 옮기면 됩니다.
 */
export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "component",
    term: "Component",
    aliases: ["컴포넌트"],
    summary:
      "UI의 독립적인 조각. 입력(props)을 받아 화면(JSX)을 반환하는 함수(또는 클래스)입니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["props", "jsx", "state"],
    relatedLessonIds: ["structure"],
    detail: [
      p(
        "React에서 UI는 ",
        term("component", "컴포넌트"),
        "의 트리로 구성됩니다. 한 컴포넌트는 다른 컴포넌트를 조합해 더 큰 화면을 만듭니다.",
      ),
      tip(
        "좋은 컴포넌트는 “한 가지 책임”에 가깝게 두고, 재사용보다 ",
        term("state-colocation", "상태 위치"),
        "와 가독성을 먼저 고민합니다.",
      ),
    ],
  },
  {
    slug: "props",
    term: "Props",
    aliases: ["프롭스"],
    summary:
      "부모 → 자식으로 전달되는 읽기 전용 입력 값. 컴포넌트의 설정·데이터 주입 수단입니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["component", "state", "unidirectional-data-flow"],
    detail: [
      p(
        "Props는 함수 인자처럼 동작합니다. 자식이 props를 직접 수정하면 데이터 흐름이 깨지므로, 변경이 필요하면 부모의 ",
        term("state", "state"),
        "를 바꾸는 콜백을 내려받습니다.",
      ),
    ],
  },
  {
    slug: "state",
    term: "State",
    aliases: ["상태"],
    summary:
      "시간이 지나며 바뀔 수 있는 컴포넌트 내부 데이터. 바뀌면 리렌더가 예약됩니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["usestate", "render", "reconciliation"],
    relatedLessonIds: ["hooks/use-state"],
    detail: [
      p(
        "State는 “지금 화면에 반영해야 하는 값”입니다. 서버에서 받은 캐시, 폼 입력, 모달 열림 여부 등이 해당합니다.",
      ),
      warn(
        "파생 값은 state로 두지 말고, 렌더 중에 계산하세요. state가 늘수록 동기화 버그가 생기기 쉽습니다.",
      ),
    ],
  },
  {
    slug: "jsx",
    term: "JSX",
    summary:
      "JavaScript 안에 XML 비슷한 UI 문법을 쓰는 문법 설탕. 빌드 시 React 요소 생성 호출로 변환됩니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["component", "virtual-dom"],
    detail: [
      p(
        "JSX는 HTML이 아닙니다. class 대신 className, 이벤트는 camelCase, 표현식은 {} 안에 넣습니다.",
      ),
    ],
  },
  {
    slug: "virtual-dom",
    term: "Virtual DOM",
    aliases: ["가상 DOM"],
    summary:
      "실제 DOM을 직접 만지지 않고, 메모리상의 객체 트리로 UI를 표현·비교하는 개념입니다.",
    category: "structure",
    difficulty: "intermediate",
    relatedSlugs: ["reconciliation", "fiber", "render"],
    relatedLessonIds: ["structure"],
    detail: [
      p(
        "매 렌더마다 새 Virtual DOM 트리를 만들고, 이전 트리와 비교(",
        term("reconciliation", "재조정"),
        ")해 바뀐 부분만 실제 DOM에 반영합니다.",
      ),
      info(
        "현대 React는 “Virtual DOM이 무조건 빠르다”보다, 선언적 UI와 예측 가능한 업데이트를 위한 수단으로 이해합니다.",
      ),
    ],
  },
  {
    slug: "reconciliation",
    term: "Reconciliation",
    aliases: ["재조정"],
    summary:
      "이전 UI 트리와 다음 UI 트리를 비교해 최소 변경을 찾아 DOM에 적용하는 과정입니다.",
    category: "structure",
    difficulty: "intermediate",
    relatedSlugs: ["virtual-dom", "fiber", "key"],
    detail: [
      p(
        "리스트에서는 ",
        term("key", "key"),
        "가 재조정 품질을 좌우합니다. index를 key로 쓰면 순서 변경 시 상태가 엉킬 수 있습니다.",
      ),
    ],
  },
  {
    slug: "fiber",
    term: "Fiber",
    summary:
      "React 16+의 재구현된 내부 유닛 단위. 작업을 쪼개고 우선순위를 매겨 중단·재개할 수 있습니다.",
    category: "structure",
    difficulty: "advanced",
    relatedSlugs: ["concurrent", "reconciliation", "render"],
    relatedLessonIds: ["structure"],
    detail: [
      p(
        "Fiber는 각 컴포넌트 인스턴스에 대응하는 작업 노드입니다. Concurrent 기능의 기반이 됩니다.",
      ),
    ],
  },
  {
    slug: "render",
    term: "Render",
    aliases: ["렌더", "렌더링"],
    summary:
      "컴포넌트 함수를 호출해 UI 트리를 계산하는 단계. 이후 커밋에서 DOM에 반영됩니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["commit", "state", "pure-component"],
    detail: [
      p(
        "렌더는 부작용(구독, DOM 조작)을 넣지 않는 것이 원칙입니다. 부수 효과는 ",
        term("useeffect", "useEffect"),
        " 등 커밋 이후 단계로 미룹니다.",
      ),
    ],
  },
  {
    slug: "commit",
    term: "Commit",
    aliases: ["커밋"],
    summary:
      "계산된 변경을 실제 DOM에 적용하고, layout/effect를 실행하는 단계입니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["render", "useeffect"],
    detail: [
      p(
        "렌더는 순수 계산, 커밋은 실제 반영으로 분리되어 있습니다. Effect는 커밋 이후에 실행됩니다.",
      ),
    ],
  },
  {
    slug: "key",
    term: "key",
    summary:
      "리스트에서 형제 요소를 안정적으로 식별하는 특수 prop. reconciliation 힌트입니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["reconciliation"],
    detail: [
      warn(
        "배열 index를 key로 쓰는 것은 순서가 고정일 때만 안전합니다. 삽입·삭제·정렬이 있으면 고유 id를 쓰세요.",
      ),
    ],
  },
  {
    slug: "hooks",
    term: "Hooks",
    aliases: ["훅"],
    summary:
      "함수 컴포넌트에서 상태·생명주기·컨텍스트 등을 연결하는 API. use로 시작합니다.",
    category: "hooks",
    difficulty: "basic",
    relatedSlugs: ["usestate", "useeffect", "rules-of-hooks"],
    relatedLessonIds: ["hooks/use-state"],
    detail: [
      p(
        "Hooks는 클래스 없이도 React 기능을 조합할 수 있게 해 줍니다. 호출 순서가 중요하므로 ",
        term("rules-of-hooks", "Rules of Hooks"),
        "를 지켜야 합니다.",
      ),
    ],
  },
  {
    slug: "usestate",
    term: "useState",
    summary: "컴포넌트에 로컬 state를 추가하는 Hook. [값, setter] 튜플을 반환합니다.",
    category: "hooks",
    difficulty: "basic",
    relatedSlugs: ["state", "batching", "hooks"],
    relatedLessonIds: ["hooks/use-state"],
    detail: [
      p(
        "setter는 비동기로 배치(",
        term("batching", "batching"),
        ")될 수 있습니다. 이전 값에 의존하면 함수형 업데이트 setX(prev => ...)를 사용하세요.",
      ),
    ],
  },
  {
    slug: "useeffect",
    term: "useEffect",
    summary:
      "렌더 결과와 외부 시스템(네트워크, DOM, 구독)을 동기화하는 Hook입니다.",
    category: "hooks",
    difficulty: "basic",
    relatedSlugs: ["commit", "cleanup", "hooks"],
    relatedLessonIds: ["hooks/use-effect"],
    detail: [
      tip(
        "Effect는 “렌더 후 동기화”입니다. 파생 데이터 계산이나 이벤트 핸들러 로직을 Effect에 넣지 마세요.",
      ),
    ],
  },
  {
    slug: "useref",
    term: "useRef",
    summary:
      "렌더 사이에 유지되는 가변 박스를 만듭니다. 값이 바뀌어도 리렌더를 일으키지 않습니다.",
    category: "hooks",
    difficulty: "basic",
    relatedSlugs: ["hooks", "state"],
    relatedLessonIds: ["hooks/use-ref"],
    detail: [
      p(
        "DOM 노드 참조, 타이머 id, 이전 값 보관 등에 적합합니다. 화면에 보여야 하는 값은 ",
        term("usestate", "useState"),
        "를 쓰세요.",
      ),
    ],
  },
  {
    slug: "usememo",
    term: "useMemo",
    summary: "의존성이 같으면 이전 계산 결과를 재사용하는 Hook입니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["usecallback", "pure-component"],
    relatedLessonIds: ["hooks/use-memo"],
    detail: [
      warn(
        "기본 최적화 수단이 아닙니다. 측정 없이 남용하면 코드만 복잡해집니다.",
      ),
    ],
  },
  {
    slug: "usecallback",
    term: "useCallback",
    summary: "의존성이 같으면 같은 함수 참조를 유지하는 Hook입니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["usememo", "memo"],
    relatedLessonIds: ["hooks/use-memo"],
    detail: [
      p(
        "자식에 ",
        term("memo", "memo"),
        "를 걸었거나 의존성 배열에 함수를 넣을 때 참조 안정성이 필요할 수 있습니다.",
      ),
    ],
  },
  {
    slug: "usecontext",
    term: "useContext",
    summary: "가장 가까운 Provider의 컨텍스트 값을 구독하는 Hook입니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["context", "props"],
    relatedLessonIds: ["hooks/use-context"],
    detail: [
      p(
        "Props drilling을 줄이지만, 값이 바뀌면 구독 컴포넌트가 리렌더됩니다. 자주 바뀌는 값은 분리하세요.",
      ),
    ],
  },
  {
    slug: "usereducer",
    term: "useReducer",
    summary:
      "action → 다음 state로 전이하는 리듀서 패턴으로 복잡한 상태를 관리합니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["state", "usestate"],
    relatedLessonIds: ["hooks/use-reducer"],
    detail: [
      tip(
        "서로 연관된 여러 필드, 또는 다음 state가 이전 state에 강하게 의존할 때 useState보다 읽기 쉽습니다.",
      ),
    ],
  },
  {
    slug: "custom-hook",
    term: "Custom Hook",
    aliases: ["커스텀 훅"],
    summary:
      "use로 시작하는 함수로 Hook 로직을 재사용·분리한 것. 새 React 기능이 아니라 조합입니다.",
    category: "hooks",
    difficulty: "advanced",
    relatedSlugs: ["hooks", "rules-of-hooks"],
    relatedLessonIds: ["hooks/custom-hooks"],
    detail: [
      p(
        "구독, 폼, 권한 체크처럼 반복되는 로직을 이름 있는 단위로 추출합니다.",
      ),
    ],
  },
  {
    slug: "rules-of-hooks",
    term: "Rules of Hooks",
    aliases: ["훅 규칙"],
    summary:
      "Hook은 최상위에서만, 매 렌더 같은 순서로 호출해야 한다는 규칙입니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["hooks"],
    detail: [
      ul(
        "조건문·반복문·중첩 함수 안에서 Hook을 호출하지 않기",
        "React 함수 컴포넌트와 커스텀 훅 안에서만 호출하기",
      ),
    ],
  },
  {
    slug: "batching",
    term: "Batching",
    aliases: ["배치 업데이트"],
    summary:
      "여러 state 업데이트를 모아서 한 번의 리렌더로 처리하는 최적화입니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["usestate", "render"],
    detail: [
      p(
        "React 18부터는 이벤트 핸들러뿐 아니라 Promise, setTimeout 등에서도 자동 배치가 기본입니다.",
      ),
    ],
  },
  {
    slug: "cleanup",
    term: "Cleanup",
    aliases: ["클린업"],
    summary:
      "Effect가 다시 실행되거나 언마운트될 때 구독·타이머를 해제하는 함수입니다.",
    category: "hooks",
    difficulty: "basic",
    relatedSlugs: ["useeffect"],
    detail: [
      p(
        "return () => { ... } 형태로 작성합니다. 누수와 중복 구독을 막는 핵심입니다.",
      ),
    ],
  },
  {
    slug: "context",
    term: "Context",
    aliases: ["컨텍스트"],
    summary:
      "트리를 건너뛰어 값을 전달하는 React 내장 메커니즘. Provider와 Consumer/useContext로 사용합니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["usecontext", "props"],
    detail: [
      info(
        "전역 상태 라이브러리 대체가 아닙니다. 테마, 로케일, 인증 세션처럼 “넓게 읽히는 값”에 적합합니다.",
      ),
    ],
  },
  {
    slug: "memo",
    term: "memo",
    summary:
      "props가 얕은 비교로 같으면 리렌더를 건너뛰는 고차 컴포넌트입니다.",
    category: "hooks",
    difficulty: "intermediate",
    relatedSlugs: ["usememo", "usecallback", "pure-component"],
    detail: [
      p(
        "비용이 큰 자식에 선택적으로 적용합니다. 부모의 인라인 객체/함수가 매번 새로 만들어지면 효과가 없습니다.",
      ),
    ],
  },
  {
    slug: "pure-component",
    term: "순수 렌더",
    aliases: ["순수성"],
    summary:
      "같은 props/state면 같은 결과를 내고, 렌더 중 외부 세계를 바꾸지 않는 것.",
    category: "structure",
    difficulty: "intermediate",
    relatedSlugs: ["render", "side-effect"],
    detail: [
      p(
        "순수하지 않은 렌더는 Strict Mode에서 두 번 호출될 때 버그로 드러납니다.",
      ),
    ],
  },
  {
    slug: "side-effect",
    term: "Side Effect",
    aliases: ["부수 효과", "사이드 이펙트"],
    summary:
      "함수 밖에서 관찰 가능한 변화를 만드는 일. 네트워크, DOM, 로컬스토리지 등.",
    category: "general",
    difficulty: "basic",
    relatedSlugs: ["useeffect", "pure-component"],
    detail: [
      p(
        "React에서는 렌더 단계가 아니라 Effect·이벤트 핸들러에서 부수 효과를 수행합니다.",
      ),
    ],
  },
  {
    slug: "unidirectional-data-flow",
    term: "단방향 데이터 흐름",
    summary: "데이터가 위에서 아래로 흐르고, 이벤트는 아래에서 위로 알리는 모델.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["props", "state"],
    detail: [
      p(
        "양방향 바인딩과 달리 데이터 출처가 명확해 디버깅이 쉽습니다.",
      ),
    ],
  },
  {
    slug: "concurrent",
    term: "Concurrent",
    aliases: ["동시성"],
    summary:
      "렌더 작업을 중단·재개·우선순위화할 수 있게 하는 React 18+ 능력의 총칭.",
    category: "structure",
    difficulty: "advanced",
    relatedSlugs: ["fiber", "suspense", "transition"],
    detail: [
      p(
        "긴급한 입력 반응을 유지하면서 무거운 업데이트를 뒤로 미룰 수 있습니다.",
      ),
    ],
  },
  {
    slug: "suspense",
    term: "Suspense",
    summary:
      "아직 준비되지 않은 UI(데이터·코드)를 기다리며 fallback을 보여주는 경계입니다.",
    category: "structure",
    difficulty: "advanced",
    relatedSlugs: ["concurrent", "rsc"],
    detail: [
      p(
        "로딩 UI를 선언적으로 배치합니다. 데이터 페칭 라이브러리·RSC와 함께 쓰입니다.",
      ),
    ],
  },
  {
    slug: "transition",
    term: "Transition",
    aliases: ["startTransition"],
    summary:
      "급하지 않은 상태 업데이트를 낮은 우선순위로 표시해 UI 응답성을 지키는 API.",
    category: "structure",
    difficulty: "advanced",
    relatedSlugs: ["concurrent", "usestate"],
    detail: [
      tip(
        "검색어 입력(긴급) vs 필터 결과 목록(전환)처럼 우선순위를 나눌 때 유용합니다.",
      ),
    ],
  },
  {
    slug: "rsc",
    term: "React Server Components",
    aliases: ["RSC", "서버 컴포넌트"],
    summary:
      "서버에서만 실행되는 컴포넌트. 번들에서 제외되고 데이터를 가까이서 읽을 수 있습니다.",
    category: "structure",
    difficulty: "advanced",
    relatedSlugs: ["suspense", "nextjs"],
    relatedLessonIds: ["history"],
    detail: [
      p(
        "클라이언트 인터랙션이 필요하면 'use client' 경계를 명시합니다. 기본은 서버입니다(App Router).",
      ),
    ],
  },
  {
    slug: "nextjs",
    term: "Next.js",
    summary:
      "React 기반 풀스택 프레임워크. 라우팅, 렌더링 전략, 번들링을 제공합니다.",
    category: "structure",
    difficulty: "intermediate",
    relatedSlugs: ["rsc"],
    relatedLessonIds: ["history"],
    detail: [
      p("이 공부 사이트는 Next.js App Router + 프론트 전용으로 구성되어 있습니다."),
    ],
  },
  {
    slug: "compound-components",
    term: "Compound Components",
    aliases: ["합성 컴포넌트"],
    summary:
      "부모·자식이 암묵적으로 상태를 공유하며 하나의 API처럼 조합되는 패턴.",
    category: "patterns",
    difficulty: "intermediate",
    relatedLessonIds: ["patterns/compound"],
    relatedSlugs: ["context"],
    detail: [
      p(
        "Select.Option처럼 유연한 마크업을 허용하면서도 내부 상태는 부모가 조율합니다.",
      ),
    ],
  },
  {
    slug: "render-props",
    term: "Render Props",
    summary:
      "무엇을 렌더할지 함수 prop으로 주입받아 동작을 공유하는 패턴.",
    category: "patterns",
    difficulty: "intermediate",
    relatedLessonIds: ["patterns/render-props"],
    relatedSlugs: ["custom-hook"],
    detail: [
      info(
        "현대 코드에서는 대부분 ",
        term("custom-hook", "커스텀 훅"),
        "으로 대체됩니다. 레거시·특수 UI에서 여전히 보입니다.",
      ),
    ],
  },
  {
    slug: "hoc",
    term: "HOC",
    aliases: ["Higher-Order Component"],
    summary:
      "컴포넌트를 받아 기능을 더한 컴포넌트를 반환하는 함수 패턴.",
    category: "patterns",
    difficulty: "intermediate",
    relatedLessonIds: ["patterns/hoc"],
    relatedSlugs: ["custom-hook"],
    detail: [
      warn(
        "props 이름 충돌, 래핑 지옥, 디버깅 난이도 때문에 신규 코드에서는 훅을 우선합니다.",
      ),
    ],
  },
  {
    slug: "controlled",
    term: "Controlled Component",
    aliases: ["제어 컴포넌트"],
    summary:
      "폼 값의 Single Source of Truth가 React state에 있는 입력 패턴.",
    category: "patterns",
    difficulty: "basic",
    relatedLessonIds: ["patterns/controlled"],
    relatedSlugs: ["uncontrolled", "state"],
    detail: [
      p("매 키 입력마다 state → value로 반영됩니다. 검증·조건부 UI에 유리합니다."),
    ],
  },
  {
    slug: "uncontrolled",
    term: "Uncontrolled Component",
    aliases: ["비제어 컴포넌트"],
    summary:
      "DOM이 값을 소유하고, 필요 시 ref로 읽는 입력 패턴.",
    category: "patterns",
    difficulty: "basic",
    relatedLessonIds: ["patterns/controlled"],
    relatedSlugs: ["controlled", "useref"],
    detail: [
      p("간단한 폼, 파일 input, 성능이 민감한 대량 입력에 가끔 쓰입니다."),
    ],
  },
  {
    slug: "state-colocation",
    term: "State Colocation",
    aliases: ["상태 공동배치"],
    summary: "상태를 실제로 필요한 가장 가까운 곳에 두는 설계 원칙.",
    category: "patterns",
    difficulty: "advanced",
    relatedLessonIds: ["patterns/colocation"],
    relatedSlugs: ["state", "render"],
    detail: [
      tip(
        "위로 올릴수록 리렌더 범위가 커집니다. 필요할 때만 lift state up 하세요.",
      ),
    ],
  },
  {
    slug: "container-presentational",
    term: "Container / Presentational",
    summary:
      "데이터·로직(Container)과 순수 UI(Presentational)를 분리하던 고전 패턴.",
    category: "patterns",
    difficulty: "basic",
    relatedLessonIds: ["patterns/container"],
    relatedSlugs: ["custom-hook"],
    detail: [
      p(
        "현대에는 커스텀 훅이 Container 역할을 대체하는 경우가 많습니다.",
      ),
    ],
  },
  {
    slug: "react-compiler",
    term: "React Compiler",
    aliases: ["컴파일러"],
    summary:
      "순수 컴포넌트를 분석해 불필요한 리렌더·값 재생성을 빌드 타임에 줄이려는 도구입니다.",
    category: "structure",
    difficulty: "advanced",
    relatedSlugs: ["usememo", "pure-component", "render"],
    relatedLessonIds: ["structure", "history"],
    detail: [
      p(
        "Rules of React(순수 렌더, Hook 규칙)를 지켜야 자동 최적화가 안전합니다. 습관적인 useMemo 남용을 줄이는 방향입니다.",
      ),
    ],
  },
  {
    slug: "error-boundary",
    term: "Error Boundary",
    aliases: ["에러 경계"],
    summary:
      "자식 트리의 렌더 에러를 잡아 폴백 UI를 보여주는 패턴입니다.",
    category: "patterns",
    difficulty: "intermediate",
    relatedLessonIds: ["patterns/error-boundary"],
    relatedSlugs: ["suspense"],
    detail: [
      warn(
        "이벤트 핸들러와 비동기 에러는 잡지 못합니다. 영역마다 경계를 나누세요.",
      ),
    ],
  },
  {
    slug: "portal",
    term: "Portal",
    aliases: ["포탈"],
    summary:
      "부모 DOM 밖(보통 document.body)에 UI를 그리면서 React 트리 관계는 유지하는 API입니다.",
    category: "structure",
    difficulty: "intermediate",
    relatedLessonIds: ["structure"],
    relatedSlugs: ["component"],
    detail: [
      p("모달·토스트처럼 overlay가 overflow/z-index에 막힐 때 사용합니다."),
    ],
  },
  {
    slug: "usetransition",
    term: "useTransition",
    summary:
      "급하지 않은 상태 업데이트를 표시해, 급한 입력이 먼저 반영되게 하는 Hook입니다.",
    category: "hooks",
    difficulty: "advanced",
    relatedLessonIds: ["hooks/use-transition"],
    relatedSlugs: ["transition", "concurrent", "usedeferredvalue"],
    detail: [
      p("입력창 값은 일반 setState, 무거운 목록은 startTransition 안에 두세요."),
    ],
  },
  {
    slug: "usedeferredvalue",
    term: "useDeferredValue",
    summary:
      "이미 있는 값을 한 박자 늦게 자식에게 전달해 급한 렌더를 보호하는 Hook입니다.",
    category: "hooks",
    difficulty: "advanced",
    relatedLessonIds: ["hooks/use-transition"],
    relatedSlugs: ["usetransition", "concurrent"],
    detail: [
      p("부모가 값을 이미 갖고 있고 자식만 무거울 때 적합합니다."),
    ],
  },
  {
    slug: "useid",
    term: "useId",
    summary:
      "SSR과 클라이언트가 같은 고유 ID를 쓰게 만들어 label/aria 연결에 쓰는 Hook입니다.",
    category: "hooks",
    difficulty: "basic",
    relatedLessonIds: ["hooks/use-id"],
    relatedSlugs: ["accessibility"],
    detail: [
      warn("리스트 key로 쓰지 마세요. key는 데이터 정체성입니다."),
    ],
  },
  {
    slug: "usesyncexternalstore",
    term: "useSyncExternalStore",
    summary:
      "React 바깥 저장소를 구독해 tearing 없이 스냅샷을 읽는 Hook입니다.",
    category: "hooks",
    difficulty: "advanced",
    relatedLessonIds: ["hooks/use-sync-external-store"],
    relatedSlugs: ["hooks", "concurrent"],
    detail: [
      p("Zustand/Redux 구현의 기반이기도 하고, window 이벤트 구독에도 씁니다."),
    ],
  },
  {
    slug: "accessibility",
    term: "Accessibility",
    aliases: ["a11y", "접근성"],
    summary:
      "키보드·스크린 리더·의미 있는 HTML로 누구나 쓰게 만드는 품질입니다.",
    category: "structure",
    difficulty: "basic",
    relatedSlugs: ["useid"],
    detail: [
      p("label–input 연결, 버튼 역할, 모달 포커스 트랩이 기본입니다."),
    ],
  },
  {
    slug: "composition",
    term: "Composition",
    aliases: ["합성"],
    summary:
      "상속 대신 children과 슬롯으로 UI를 조립하는 React의 기본 확장 방법입니다.",
    category: "patterns",
    difficulty: "basic",
    relatedLessonIds: ["patterns/composition"],
    relatedSlugs: ["compound-components", "props"],
    detail: [
      tip("불리언 props가 늘어나면 합성을 먼저 검토하세요."),
    ],
  },
];

export function getGlossaryTermLocal(slug: string) {
  return glossaryTerms.find((t) => t.slug === slug) ?? null;
}

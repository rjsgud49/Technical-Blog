import type { Lesson } from "@/types/lesson";
import {
  p,
  ul,
  ol,
  code,
  tip,
  warn,
  info,
  term,
  inlineCode,
} from "@/lib/content/helpers";

export const structureLesson: Lesson = {
  id: "structure",
  slug: "structure",
  title: "React 구조 심화",
  description:
    "컴포넌트와 JSX, 렌더·커밋, Fiber, Concurrent, 컴파일러, 에러 경계까지 — React가 UI를 그리는 방식을 구조적으로 이해합니다.",
  category: "structure",
  difficulty: "intermediate",
  readingTime: "28 min",
  relatedTermSlugs: [
    "component",
    "props",
    "jsx",
    "virtual-dom",
    "reconciliation",
    "fiber",
    "render",
    "commit",
    "key",
    "state",
    "unidirectional-data-flow",
    "pure-component",
    "concurrent",
    "batching",
    "transition",
    "react-compiler",
    "rsc",
    "error-boundary",
    "portal",
  ],
  sections: [
    {
      id: "jsx",
      title: "컴포넌트와 JSX",
      difficulty: "basic",
      blocks: [
        p(
          "React는 UI를 ",
          term("component", "컴포넌트"),
          "의 트리로 봅니다. 각 컴포넌트는 ",
          term("props", "props"),
          "를 입력받아 ",
          term("jsx", "JSX"),
          "를 반환하는 함수(또는 클래스)입니다. “화면의 조각”을 조합해 더 큰 화면을 만듭니다.",
        ),
        p(
          "JSX는 HTML이 아닙니다. 빌드 시 ",
          inlineCode("React.createElement"),
          " 또는 자동 JSX 런타임 호출로 변환되어, 메모리상의 React 요소 객체가 됩니다. 이 객체가 ",
          term("virtual-dom", "Virtual DOM"),
          " 트리의 한 노드가 됩니다.",
        ),
        code(
          `function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      {children}
    </article>
  );
}

// JSX ≈ 요소 설명서
// <Card title="안녕" /> → { type: Card, props: { title: "안녕" } }`,
          "tsx",
          "컴포넌트 = props → UI",
        ),
        ul(
          ["class 대신 ", inlineCode("className")],
          ["이벤트는 camelCase (", inlineCode("onClick"), ")"],
          ["표현식은 ", inlineCode("{ }"), " 안에"],
          ["형제 여러 개는 Fragment ", inlineCode("<>...</>"), "로 감싸기"],
        ),
        tip(
          "좋은 컴포넌트 경계는 “재사용”보다 “한 화면에서 이해 가능한 단위”에서 시작합니다. 너무 잘게 쪼개면 props 전달만 늘어납니다.",
        ),
        warn(
          "렌더 중에 props나 전역 객체를 직접 수정하지 마세요. 같은 입력에 같은 출력이 나와야 ",
          term("pure-component", "순수 렌더"),
          "가 유지됩니다.",
        ),
      ],
    },
    {
      id: "rendering",
      title: "렌더링 모델",
      difficulty: "intermediate",
      blocks: [
        p(
          "React의 업데이트는 크게 ",
          term("render", "렌더"),
          "와 ",
          term("commit", "커밋"),
          "으로 나뉩니다. 렌더는 “다음에 무엇이 보여야 하는가”를 계산하는 순수에 가까운 단계이고, 커밋은 그 결과를 실제 DOM에 반영하고 Effect를 돌리는 단계입니다.",
        ),
        ol(
          [
            "트리거: ",
            term("state", "state"),
            " / props / context 변경으로 리렌더 예약",
          ],
          [
            "렌더: 컴포넌트 함수 호출 → 새 요소 트리 생성",
          ],
          [
            term("reconciliation", "재조정"),
            ": 이전 트리와 비교해 변경점 산출",
          ],
          [
            "커밋: DOM 반영 → layout → ",
            term("useeffect", "useEffect"),
            " 등 실행",
          ],
        ),
        p(
          "부모의 state가 바뀌면 기본적으로 자식도 함께 리렌더됩니다. “리렌더 = DOM이 다시 그려진다”가 아닙니다. 계산은 다시 하지만, 재조정이 “같다”고 판단하면 DOM은 그대로일 수 있습니다.",
        ),
        code(
          `function Parent() {
  const [n, setN] = useState(0);
  return (
    <div>
      <button onClick={() => setN((v) => v + 1)}>count: {n}</button>
      {/* Parent가 리렌더되면 Child 함수도 다시 호출된다 */}
      <Child label="hello" />
    </div>
  );
}

function Child({ label }: { label: string }) {
  console.log("Child render"); // 렌더 단계 로그
  return <p>{label}</p>;
}`,
          "tsx",
          "리렌더는 함수 재호출",
        ),
        info(
          "Strict Mode(개발)에서는 순수성 검사를 위해 렌더·일부 Effect를 의도적으로 두 번 실행할 수 있습니다. 프로덕션과 로그 횟수가 다를 수 있어요.",
        ),
        tip(
          "부수 효과(네트워크, 구독, DOM 직접 조작)는 렌더 본문이 아니라 이벤트 핸들러나 Effect에 두세요. 렌더는 계산, 커밋 이후가 동기화입니다.",
        ),
      ],
    },
    {
      id: "fiber",
      title: "Virtual DOM & Fiber",
      difficulty: "advanced",
      blocks: [
        p(
          term("virtual-dom", "Virtual DOM"),
          "은 “항상 빠르다”는 마법의 층이 아니라, 선언적 UI를 구현하기 위한 중간 표현입니다. 매 렌더마다 새 트리를 만들고, ",
          term("reconciliation", "재조정"),
          "으로 최소 변경을 찾습니다.",
        ),
        p(
          "React 16+의 재조정 단위가 ",
          term("fiber", "Fiber"),
          "입니다. Fiber는 각 컴포넌트 인스턴스에 대응하는 작업 노드로, 우선순위·형제 링크·대체(alternate) 트리를 가집니다. 덕분에 긴 작업을 쪼개고, 급한 입력에 양보할 수 있는 ",
          term("concurrent", "Concurrent"),
          " 렌더링이 가능해졌습니다.",
        ),
        code(
          `// 리스트 재조정의 핵심 힌트: key
function TodoList({ todos }: { todos: { id: string; text: string }[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

// ❌ index를 key로 쓰면 삽입/삭제/정렬 시 상태가 엉킬 수 있음
// {todos.map((todo, i) => <li key={i}>...)}`,
          "tsx",
          "key와 재조정",
        ),
        ul(
          [
            term("key", "key"),
            "는 형제 사이에서 안정적인 정체성. 재조정 품질을 좌우",
          ],
          [
            "타입이 바뀌면(div → span, A → B) Fiber를 버리고 새로 만듦 → state 초기화",
          ],
          [
            "같은 위치·같은 타입이면 props만 갱신하고 인스턴스 유지",
          ],
        ),
        warn(
          "배열 index를 key로 쓰는 것은 순서가 절대 안 바뀔 때만 안전합니다. 입력 필드가 리스트 안에 있으면 특히 위험합니다.",
        ),
        info(
          "Fiber 내부를 다 외울 필요는 없습니다. “렌더는 중단될 수 있고, 커밋은 한 번에 반영된다” 정도만 잡아도 Concurrent API를 이해하는 데 충분합니다.",
        ),
      ],
    },
    {
      id: "data-flow",
      title: "상태와 데이터 흐름",
      difficulty: "intermediate",
      blocks: [
        p(
          "React의 기본 모델은 ",
          term("unidirectional-data-flow", "단방향 데이터 흐름"),
          "입니다. 데이터는 부모 → 자식으로 ",
          term("props", "props"),
          "를 타고 내려가고, 이벤트는 자식 → 부모로 콜백을 통해 알립니다. 양방향 바인딩과 달리 “값이 어디서 왔는지”가 명확합니다.",
        ),
        p(
          term("state", "state"),
          "는 “시간이 지나며 바뀌고, 바뀌면 화면에 반영해야 하는 값”입니다. 파생 값은 state로 두지 말고 렌더 중 계산하세요. state가 늘수록 동기화 버그가 생기기 쉽습니다.",
        ),
        code(
          `function Price({ amount, taxRate }: { amount: number; taxRate: number }) {
  // ✅ 파생 값 — state 아님
  const total = amount * (1 + taxRate);

  return <p>합계: {total.toFixed(0)}원</p>;
}

function Parent() {
  const [amount, setAmount] = useState(10000);
  return (
    <>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <Price amount={amount} taxRate={0.1} />
    </>
  );
}`,
          "tsx",
          "Single Source of Truth",
        ),
        ul(
          [
            "내려보내기: props로 데이터·콜백 전달",
          ],
          [
            "올려보내기(lift state up): 공통 부모가 state를 소유",
          ],
          [
            "건너뛰기: ",
            term("context", "Context"),
            " — 넓게 읽히는 값(테마, 세션)에 적합",
          ],
        ),
        tip(
          "상태를 너무 위에 두면 리렌더 범위가 커집니다. 실제로 필요한 가장 가까운 곳에 두는 ",
          term("state-colocation", "State Colocation"),
          "을 함께 익히세요.",
        ),
        warn(
          "자식이 props를 직접 mutate하지 마세요. 변경이 필요하면 부모가 준 setter/콜백으로만 올리세요. 단방향 흐름이 깨지면 디버깅이 급격히 어려워집니다.",
        ),
      ],
    },
    {
      id: "concurrent",
      title: "Concurrent와 자동 배치",
      difficulty: "advanced",
      blocks: [
        p(
          term("concurrent", "Concurrent"),
          "는 “멀티스레드 React”가 아닙니다. 메인 스레드에서 렌더 작업을 잘게 쪼개고, 급한 일(타이핑·클릭)이 오면 덜 급한 렌더를 양보하는 스케줄링 모델입니다. 커밋은 여전히 한 번에, 일관된 화면으로 반영됩니다.",
        ),
        p(
          "React 18부터는 이벤트 핸들러뿐 아니라 타임아웃·Promise 콜백 안의 여러 ",
          inlineCode("setState"),
          "도 기본적으로 한 번의 리렌더로 묶입니다. 이것이 ",
          term("batching", "자동 배치"),
          "입니다. 예전처럼 “비동기 콜백이면 매번 렌더”가 아닙니다.",
        ),
        code(
          `function Cart() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  async function add() {
    await saveToServer();
    // React 18+: 두 setState가 한 렌더로 묶임
    setCount((c) => c + 1);
    setOpen(true);
  }

  return (
    <button onClick={() => void add()}>
      {count}개 {open ? "장바구니 열림" : ""}
    </button>
  );
}`,
          "tsx",
          "자동 배치는 이벤트 밖에서도",
        ),
        p(
          "급한 UI와 무거운 계산을 나누려면 ",
          term("transition", "startTransition"),
          " / ",
          inlineCode("useTransition"),
          "을 씁니다. 입력창 값은 즉시 반영하고, 필터 결과·탭 콘텐츠처럼 커도 되는 업데이트는 양보 가능하게 표시합니다. 사용자가 “먹통”을 덜 느끼게 하는 도구입니다.",
        ),
        ul(
          [
            "긴급: 입력 value, 포커스, 호버 — 일반 setState",
          ],
          [
            "급하지 않음: 검색 결과, 차트, 큰 목록 — Transition",
          ],
          [
            inlineCode("useDeferredValue"),
            ": 이미 있는 값을 “늦게 따라오게” 만들 때",
          ],
        ),
        info(
          "렌더는 중단될 수 있어도 커밋은 원자적입니다. 화면에 반만 바뀐 트리가 보이지 않도록 설계되어 있습니다.",
        ),
        warn(
          "Transition 안에서도 사용자 입력 상태를 넣으면 안 됩니다. 입력은 긴급 업데이트로 두고, 그 결과로 파생되는 무거운 일만 Transition으로 보내세요.",
        ),
      ],
    },
    {
      id: "compiler",
      title: "React Compiler와 메모이제이션",
      difficulty: "advanced",
      blocks: [
        p(
          term("react-compiler", "React Compiler"),
          "는 컴포넌트를 분석해 리렌더와 값 재계산을 자동으로 줄이려는 빌드 타임 도구입니다. 수동 ",
          term("usememo", "useMemo"),
          " / ",
          term("usecallback", "useCallback"),
          " / ",
          inlineCode("memo()"),
          "를 “습관적으로” 뿌리지 않아도 되게 만드는 방향입니다.",
        ),
        p(
          "컴파일러가 잘 동작하려면 컴포넌트가 ",
          term("pure-component", "순수"),
          "해야 합니다. 렌더 중 외부 변수를 바꾸고, 조건부로 Hook을 호출하고, 배열을 매 렌더 mutate하면 분석이 깨지거나 최적화가 빠집니다. Rules of React가 성능 규칙이기도 한 이유입니다.",
        ),
        code(
          `// 컴파일러(또는 사람)가 안전하게 캐시하려면
function Price({ items }: { items: { price: number }[] }) {
  // ✅ 같은 items면 같은 합계 — 순수 계산
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return <p>{total}원</p>;
}

// ❌ 렌더 중 모듈 변수/props를 직접 수정하면 캐시 불가
let leak = 0;
function Bad() {
  leak += 1;
  return <span>{leak}</span>;
}`,
          "tsx",
          "순수해야 자동 메모가 가능하다",
        ),
        ul(
          [
            "아직 컴파일러가 없는 코드베이스: 측정된 병목에만 memo를 넣는다",
          ],
          [
            "참조 동일성이 계약인 API(의존성 배열, React.memo 자식)에서만 useCallback을 쓴다",
          ],
          [
            "추측성 최적화는 가독성을 해치고, 잘못된 deps는 더 느려질 수 있다",
          ],
        ),
        tip(
          "성능은 React DevTools Profiler로 “어떤 컴포넌트가 왜 리렌더됐는지”를 본 뒤에 손대세요. Fiber 구조를 이해하면 Profiler 타임라인이 훨씬 잘 읽힙니다.",
        ),
        info(
          term("rsc", "Server Components"),
          "는 컴파일러와 다른 축입니다. 서버에서 실행되어 번들에서 빠지고, 클라이언트 경계를 ",
          inlineCode("'use client'"),
          "로 명시합니다. SSR(HTML 미리 그리기)과 실행 위치 분리(RSC)를 섞지 마세요.",
        ),
      ],
    },
    {
      id: "resilience",
      title: "이벤트 · 포털 · 에러 경계",
      difficulty: "intermediate",
      blocks: [
        p(
          "React 이벤트는 브라우저 이벤트를 감싼 합성 이벤트입니다. 위임으로 루트에 붙고, ",
          inlineCode("onClick"),
          "처럼 camelCase입니다. ",
          inlineCode("preventDefault()"),
          "는 쓰지만, 대부분의 경우 ",
          inlineCode("return false"),
          "에 의존하지 않습니다.",
        ),
        p(
          term("portal", "Portal"),
          "은 부모 DOM 밖(보통 ",
          inlineCode("document.body"),
          ")에 모달·토스트·툴팁을 그립니다. 시각적 위치는 바깥이지만, React 트리상 부모-자식 관계(Context, 이벤트 버블의 React 경로)는 유지됩니다. z-index와 overflow: hidden을 뚫을 때 필수입니다.",
        ),
        code(
          `import { createPortal } from "react-dom";

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return createPortal(
    <div className="overlay" onClick={onClose} role="dialog">
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}`,
          "tsx",
          "Portal로 모달을 body에 붙이기",
        ),
        p(
          term("error-boundary", "Error Boundary"),
          "는 자식 트리의 렌더 에러를 잡아 폴백 UI를 보여 줍니다. 이벤트 핸들러·비동기·서버 에러는 잡지 못합니다. 클래스의 ",
          inlineCode("getDerivedStateFromError"),
          " / ",
          inlineCode("componentDidCatch"),
          "로 구현하며, 앱 전체 한 개가 아니라 위젯 단위로 여러 개를 두는 편이 안전합니다.",
        ),
        ul(
          [
            "잡힘: 렌더, 생명주기, 자식 트리의 Hook 렌더 예외",
          ],
          [
            "안 잡힘: click 핸들러, setTimeout, fetch 실패, 서버 컴포넌트 예외(프레임워크 경계 필요)",
          ],
          [
            "실무: 라우트/위젯마다 경계를 두고, 로깅 서비스로 componentDidCatch를 연결",
          ],
        ),
        warn(
          "에러 경계가 없다고 예외가 조용히 사라지지 않습니다. 루트까지 올라가면 흰 화면이 됩니다. 중요한 목록·편집기·결제 UI는 각각 감싸 두세요.",
        ),
        tip(
          "개발 Strict Mode는 렌더와 Effect를 두 번 돌려 순수성·클린업을 검사합니다. “두 번 fetch 된다”고 Effect를 지우기보다, 클린업과 abort 또는 프레임워크 데이터 로딩을 먼저 검토하세요.",
        ),
      ],
    },
  ],
};

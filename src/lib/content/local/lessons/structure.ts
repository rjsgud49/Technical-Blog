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
    "컴포넌트와 JSX, 렌더·커밋, Fiber 재조정, 단방향 데이터 흐름까지 — React가 UI를 그리는 방식을 구조적으로 이해합니다.",
  category: "structure",
  difficulty: "intermediate",
  readingTime: "16 min",
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
  ],
};

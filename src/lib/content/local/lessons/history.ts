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

export const historyLesson: Lesson = {
  id: "history",
  slug: "history",
  title: "React의 역사",
  description:
    "Facebook에서의 탄생부터 Fiber, Hooks, Concurrent, RSC까지 — React가 왜 이렇게 진화했는지 흐름으로 이해합니다.",
  category: "history",
  difficulty: "basic",
  readingTime: "14 min",
  relatedTermSlugs: [
    "fiber",
    "hooks",
    "concurrent",
    "suspense",
    "transition",
    "rsc",
    "nextjs",
    "virtual-dom",
    "jsx",
  ],
  sections: [
    {
      id: "origin",
      title: "탄생과 배경",
      difficulty: "basic",
      blocks: [
        p(
          "2011년경 Facebook(현 Meta) 광고·뉴스피드 팀은 복잡한 UI를 수동으로 DOM에 맞추는 비용이 커지고 있었습니다. 데이터가 바뀌면 “어디를 다시 그려야 하는지”를 사람이 추적해야 했고, 버그와 성능 이슈가 반복됐습니다.",
        ),
        p(
          "Jordan Walke가 제안한 아이디어의 핵심은 단순했습니다. UI를 ",
          term("jsx", "JSX"),
          "로 선언하고, 상태가 바뀌면 전체가 어떻게 보여야 하는지만 다시 계산하게 하자는 것. 실제 DOM 조작은 라이브러리가 ",
          term("virtual-dom", "Virtual DOM"),
          " 비교를 통해 최소화합니다.",
        ),
        p(
          "2013년 JSConf US에서 React가 공개됐을 때 반응은 엇갈렸습니다. “HTML을 JS 안에 넣는다고?”라는 거부감도 있었지만, 단방향 데이터와 컴포넌트 모델은 규모가 큰 제품에서 빠르게 설득력을 얻었습니다.",
        ),
        ul(
          [
            "문제: 명령형 DOM 조작으로 인한 상태·UI 불일치",
          ],
          [
            "해법: ",
            term("component", "컴포넌트"),
            " + 선언적 ",
            term("render", "렌더"),
          ],
          [
            "결과: UI를 “함수의 결과”처럼 다루게 됨",
          ],
        ),
        info(
          "초기의 React는 클래스 컴포넌트와 ",
          inlineCode("createClass"),
          "가 중심이었습니다. 지금의 함수 컴포넌트 + ",
          term("hooks", "Hooks"),
          " 세상은 훨씬 뒤의 이야기입니다.",
        ),
        code(
          `// 초기 사고방식의 핵심 (개념)
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}

// 데이터가 바뀌면 “최종 UI”만 다시 기술한다
<Greeting name="React" />`,
          "tsx",
          "선언적 UI의 시작",
        ),
        tip(
          "역사를 외울 필요는 없습니다. “왜 Virtual DOM이 등장했는지”만 기억하면, 이후 Fiber·Concurrent 이야기도 자연스럽게 이어집니다.",
        ),
      ],
    },
    {
      id: "versions",
      title: "주요 버전 흐름",
      difficulty: "basic",
      blocks: [
        p(
          "React의 버전 히스토리는 기능 나열이 아니라, 성능·개발자 경험·확장성을 위한 엔진 교체에 가깝습니다. 아래는 학습에 도움이 되는 이정표입니다.",
        ),
        ol(
          [
            "0.x ~ 15: 스택 재조정기. 한 번 시작하면 끝날 때까지 동기적으로 트리를 순회",
          ],
          [
            "16 (2017): ",
            term("fiber", "Fiber"),
            " 아키텍처. 작업을 쪼개고 우선순위를 둘 수 있는 기반",
          ],
          [
            "16.8 (2019): ",
            term("hooks", "Hooks"),
            " 공개. 함수 컴포넌트가 상태·부수효과를 가질 수 있게 됨",
          ],
          [
            "17: 점진적 업그레이드 지원. “새 기능보다 기반 정비”에 가까운 릴리스",
          ],
          [
            "18: ",
            term("concurrent", "Concurrent"),
            " 렌더링, 자동 ",
            term("batching", "batching"),
            ", ",
            term("suspense", "Suspense"),
            " 데이터 로딩 확장",
          ],
          [
            "19 전후: ",
            term("rsc", "React Server Components"),
            "와 컴파일러 방향이 생태계 중심으로 이동",
          ],
        ),
        p(
          "Fiber 이전에는 긴 렌더가 메인 스레드를 막아 입력 지연이 두드러졌습니다. Fiber는 각 컴포넌트 작업을 단위로 두고, 필요할 때 양보·재개할 수 있게 만들었습니다. 이것이 나중에 Concurrent UI의 토대가 됩니다.",
        ),
        code(
          `// Hooks 이전: 클래스로 상태를 관리
class Counter extends React.Component {
  state = { count: 0 };
  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}

// Hooks 이후: 같은 아이디어를 함수로
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>{count}</button>
  );
}`,
          "tsx",
          "클래스에서 Hooks로",
        ),
        warn(
          "버전만 올리고 API를 그대로 두면 “새 React”를 쓰는 게 아닙니다. Concurrent 기능을 쓰려면 ",
          term("transition", "startTransition"),
          ", Suspense 경계, 서버/클라이언트 경계 설계까지 함께 봐야 합니다.",
        ),
        tip(
          "실무에서는 “우리 앱이 React 18+인가?”보다 “자동 배치가 켜져 있는가, Strict Mode에서 Effect가 두 번 도는가”를 먼저 확인하는 편이 도움이 됩니다.",
        ),
      ],
    },
    {
      id: "modern",
      title: "현대 React의 방향",
      difficulty: "intermediate",
      blocks: [
        p(
          "현대 React는 “클라이언트가 모든 것을 그린다”에서 “서버와 클라이언트가 역할을 나눈다”로 이동하고 있습니다. 동시에, 인터랙션의 응답성을 지키기 위해 렌더 우선순위를 명시하는 API가 늘었습니다.",
        ),
        p(
          term("concurrent", "Concurrent"),
          " 모델에서는 급한 업데이트(타이핑, 클릭)와 급하지 않은 업데이트(필터 결과, 탭 전환 후 무거운 목록)를 구분할 수 있습니다. ",
          term("transition", "Transition"),
          "으로 표시된 업데이트는 중단·재개될 수 있고, 사용자는 입력 반응을 먼저 느낍니다.",
        ),
        code(
          `import { useState, startTransition } from "react";

function Search({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setQuery(next); // 긴급: 입력창은 바로 반영

    startTransition(() => {
      // 급하지 않음: 필터 계산은 양보 가능
      setResults(items.filter((item) => item.includes(next)));
    });
  }

  return (
    <>
      <input value={query} onChange={onChange} />
      <ul>
        {results.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  );
}`,
          "tsx",
          "Transition으로 우선순위 나누기",
        ),
        p(
          term("rsc", "React Server Components"),
          "는 서버에서만 실행되는 컴포넌트를 도입합니다. 번들에서 빠지고, 데이터 소스에 가까이서 읽을 수 있으며, 클라이언트에는 직렬화된 UI 결과가 전달됩니다. 상호작용이 필요한 부분은 ",
          inlineCode("'use client'"),
          " 경계 뒤로 밀어 넣습니다.",
        ),
        ul(
          [
            term("suspense", "Suspense"),
            ": 아직 준비되지 않은 UI의 로딩 경계를 선언적으로 배치",
          ],
          [
            term("nextjs", "Next.js"),
            " App Router: RSC를 기본으로 한 풀스택 React 프레임워크의 대표 사례",
          ],
          [
            "컴파일러 방향: 수동 ",
            term("usememo", "useMemo"),
            " / ",
            term("usecallback", "useCallback"),
            " 남용을 줄이려는 시도",
          ],
        ),
        info(
          "이 학습 사이트도 ",
          term("nextjs", "Next.js"),
          " App Router 위에서 돌아가지만, 본문은 프레임워크 사용법보다 React 개념 자체에 초점을 둡니다.",
        ),
        warn(
          "RSC는 “서버사이드 렌더링(SSR)과 같은 말”이 아닙니다. SSR은 HTML을 미리 그리는 전략이고, RSC는 컴포넌트의 실행 위치를 나누는 모델입니다. 둘은 함께 쓰이지만 개념이 다릅니다.",
        ),
        p(
          "정리하면 React의 역사는 세 번의 큰 전환으로 요약할 수 있습니다. (1) 선언적 UI와 Virtual DOM, (2) Fiber + Hooks로 엔진·DX 재설계, (3) Concurrent + RSC로 응답성과 서버 경계를 제품 확장. 이후 문서에서는 이 기반 위에서 구조·훅·패턴을 깊게 파고듭니다.",
        ),
      ],
    },
  ],
};

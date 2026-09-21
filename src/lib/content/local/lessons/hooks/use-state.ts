import type { Lesson } from "@/types/lesson";
import {
  p,
  ul,
  code,
  tip,
  warn,
  info,
  term,
  inlineCode,
} from "@/lib/content/helpers";

export const useStateLesson: Lesson = {
  id: "hooks/use-state",
  slug: "use-state",
  title: "useState",
  description:
    "상태의 기본 단위와 배치 업데이트, 함수형 업데이트를 이해합니다. 언제 state를 두고 언제 계산으로 둘지 기준을 잡습니다.",
  category: "hooks",
  difficulty: "basic",
  readingTime: "10 min",
  relatedTermSlugs: [
    "usestate",
    "state",
    "hooks",
    "batching",
    "render",
    "rules-of-hooks",
  ],
  sections: [
    {
      id: "why",
      title: "왜 useState인가",
      difficulty: "basic",
      blocks: [
        p(
          term("usestate", "useState"),
          "는 함수 컴포넌트에 로컬 ",
          term("state", "state"),
          "를 붙이는 가장 기본적인 ",
          term("hooks", "Hook"),
          "입니다. 값이 바뀌면 React가 해당 컴포넌트의 ",
          term("render", "리렌더"),
          "를 예약하고, 새 UI를 계산합니다.",
        ),
        p(
          "화면에 보여야 하고, 사용자 입력·시간·서버 응답에 따라 바뀌는 값이 state 후보입니다. 반대로 props나 다른 state에서 바로 계산되는 값은 state로 두지 않습니다.",
        ),
        code(
          `import { useState } from "react";

function Toggle() {
  const [on, setOn] = useState(false);

  return (
    <button onClick={() => setOn((prev) => !prev)}>
      {on ? "켜짐" : "꺼짐"}
    </button>
  );
}`,
          "tsx",
          "최소 예시",
        ),
        tip(
          "초기값이 비싸면 ",
          inlineCode("useState(() => expensive())"),
          "처럼 lazy initializer를 쓰세요. 매 렌더마다 함수를 호출하는 게 아니라, 마운트 시에만 실행됩니다.",
        ),
      ],
    },
    {
      id: "updates",
      title: "업데이트와 배치",
      difficulty: "basic",
      blocks: [
        p(
          "setter에 다음 값을 직접 넣거나, 이전 값에 의존하는 함수를 넣을 수 있습니다. 연속 클릭·비동기 콜백처럼 “지금 화면에 보이는 값”이 최신이 아닐 수 있을 때는 함수형 업데이트가 안전합니다.",
        ),
        code(
          `function Counter() {
  const [count, setCount] = useState(0);

  function bumpTwiceWrong() {
    setCount(count + 1);
    setCount(count + 1); // 둘 다 같은 count를 기준으로 계산 → +1만 될 수 있음
  }

  function bumpTwiceRight() {
    setCount((c) => c + 1);
    setCount((c) => c + 1); // 큐에 쌓여 +2
  }

  return <button onClick={bumpTwiceRight}>{count}</button>;
}`,
          "tsx",
          "함수형 업데이트",
        ),
        p(
          "React 18부터는 이벤트 핸들러뿐 아니라 Promise, ",
          inlineCode("setTimeout"),
          " 안에서도 여러 업데이트가 ",
          term("batching", "batching"),
          "되어 기본적으로 한 번만 리렌더됩니다. 매 setter마다 즉시 반영된다고 가정하지 마세요.",
        ),
        warn(
          "객체를 state로 둘 때는 불변 업데이트(",
          inlineCode("{ ...prev, x: 1 }"),
          ")를 지키세요. 같은 참조를 mutate하면 React가 변경을 감지하지 못할 수 있습니다.",
        ),
        info(
          term("rules-of-hooks", "Rules of Hooks"),
          " — ",
          inlineCode("useState"),
          "는 조건문·반복문 안이 아니라 컴포넌트(또는 커스텀 훅) 최상위에서 호출해야 합니다.",
        ),
      ],
    },
    {
      id: "pitfalls",
      title: "흔한 함정",
      difficulty: "intermediate",
      blocks: [
        ul(
          [
            "파생 값을 state로 복제 → 두 값이 어긋남. 렌더 중 계산하세요",
          ],
          [
            "props를 state에 복사한 뒤 동기화를 잊음. 제어가 필요하면 key로 리마운트하거나 props를 직접 쓰기",
          ],
          [
            "setter 직후 같은 스코프에서 state 변수를 읽음 → 아직 이전 값. 로컬 변수나 함수형 업데이트 사용",
          ],
        ),
        code(
          `// ❌ 파생 state
const [first, setFirst] = useState("");
const [full, setFull] = useState("");
// first 바뀔 때마다 setFull(first + "님") … 동기화 지옥

// ✅ 렌더 중 계산
const [first, setFirst] = useState("");
const full = first + "님";`,
          "tsx",
          "파생 값은 계산",
        ),
        tip(
          "필드가 서로 강하게 묶이면 ",
          term("usereducer", "useReducer"),
          "나 하나의 객체 state로 묶는 편이 읽기 쉬울 수 있습니다.",
        ),
      ],
    },
  ],
};

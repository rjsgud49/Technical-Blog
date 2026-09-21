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

export const useRefLesson: Lesson = {
  id: "hooks/use-ref",
  slug: "use-ref",
  title: "useRef",
  description:
    "DOM 접근과 렌더에 영향 없는 값 보관 패턴을 익힙니다. state와 언제 나눠 쓸지 기준을 잡습니다.",
  category: "hooks",
  difficulty: "basic",
  readingTime: "8 min",
  relatedTermSlugs: ["useref", "hooks", "state", "usestate", "render"],
  sections: [
    {
      id: "box",
      title: "리렌더 없는 가변 박스",
      difficulty: "basic",
      blocks: [
        p(
          term("useref", "useRef"),
          "는 ",
          inlineCode("{ current: ... }"),
          " 형태의 객체를 만들고, 그 객체 참조는 리렌더 사이에 유지됩니다. ",
          inlineCode("current"),
          "를 바꿔도 ",
          term("render", "리렌더"),
          "가 일어나지 않습니다.",
        ),
        p(
          "화면에 보여야 하는 값은 ",
          term("usestate", "useState"),
          "를, “기억만 하면 되고 UI와 무관한 값”은 useRef를 씁니다. 타이머 id, 이전 props, 인터벌 핸들, 외부 라이브러리 인스턴스가 대표적입니다.",
        ),
        code(
          `import { useEffect, useRef, useState } from "react";

function Stopwatch() {
  const [ms, setMs] = useState(0);
  const idRef = useRef<number | null>(null);

  function start() {
    if (idRef.current !== null) return;
    idRef.current = window.setInterval(() => {
      setMs((v) => v + 100);
    }, 100);
  }

  function stop() {
    if (idRef.current === null) return;
    clearInterval(idRef.current);
    idRef.current = null;
  }

  useEffect(() => () => stop(), []);

  return (
    <div>
      <p>{ms}ms</p>
      <button onClick={start}>시작</button>
      <button onClick={stop}>정지</button>
    </div>
  );
}`,
          "tsx",
          "타이머 id를 ref에",
        ),
        tip(
          "ref 변경은 렌더를 트리거하지 않으므로, “이 값이 바뀌면 화면을 갱신해야 한다”면 state입니다.",
        ),
      ],
    },
    {
      id: "dom",
      title: "DOM 노드 참조",
      difficulty: "basic",
      blocks: [
        p(
          "JSX에 ",
          inlineCode("ref={myRef}"),
          "를 붙이면 커밋 후 ",
          inlineCode("myRef.current"),
          "에 DOM 노드가 들어갑니다. focus, scroll, 측정, 비제어 입력 읽기에 사용합니다.",
        ),
        code(
          `function SearchField() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="검색" />;
}`,
          "tsx",
          "마운트 시 포커스",
        ),
        warn(
          "렌더 중에 ",
          inlineCode("ref.current"),
          "를 읽거나 쓰지 마세요. 타이밍이 보장되지 않고, Concurrent 렌더에서 예측이 깨질 수 있습니다. 읽기/쓰기는 이벤트·Effect에서.",
        ),
        info(
          "함수 컴포넌트에서 부모에게 ref를 노출하려면 ",
          inlineCode("forwardRef"),
          " 또는 React 19의 ref-as-prop 패턴을 사용합니다.",
        ),
      ],
    },
    {
      id: "patterns",
      title: "실전 패턴",
      difficulty: "intermediate",
      blocks: [
        ul(
          [
            "이전 값 보관: 렌더 후 Effect에서 ",
            inlineCode("prev.current = value"),
          ],
          [
            "최신 콜백 유지: Effect 의존성을 줄이려 ",
            inlineCode("callbackRef.current = fn"),
          ],
          [
            "비제어 폼: ",
            term("uncontrolled", "Uncontrolled"),
            " 입력과 조합",
          ],
        ),
        code(
          `function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}`,
          "tsx",
          "이전 값 훅",
        ),
        tip(
          "ref로 “최신 props”를 우회하는 패턴은 의존성 배열을 속이기 쉽습니다. 가능하면 의존성을 정직하게 맞추고, 우회는 측정된 필요가 있을 때만 쓰세요.",
        ),
      ],
    },
  ],
};

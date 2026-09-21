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

export const useTransitionLesson: Lesson = {
  id: "hooks/use-transition",
  slug: "use-transition",
  title: "useTransition / useDeferredValue",
  description:
    "급한 입력과 무거운 렌더를 나누는 Concurrent Hook입니다. 검색·탭·필터처럼 “입력은 즉시, 결과는 양보”가 필요할 때 씁니다.",
  category: "hooks",
  difficulty: "advanced",
  readingTime: "12 min",
  relatedTermSlugs: [
    "usetransition",
    "usedeferredvalue",
    "transition",
    "concurrent",
    "suspense",
    "hooks",
  ],
  sections: [
    {
      id: "priority",
      title: "우선순위를 나누는 이유",
      difficulty: "advanced",
      blocks: [
        p(
          "큰 목록을 매 키 입력마다 동기 렌더하면 커서가 늦게 따라옵니다. ",
          term("concurrent", "Concurrent"),
          " 모델에서는 입력 같은 긴급 업데이트와, 필터 결과 같은 급하지 않은 업데이트를 구분할 수 있습니다.",
        ),
        p(
          term("usetransition", "useTransition"),
          "은 ",
          inlineCode("startTransition"),
          "과 대기 플래그 ",
          inlineCode("isPending"),
          "을 줍니다. Transition 안의 setState는 중단·재개될 수 있고, 그동안 이전 UI를 유지하거나 pending UI를 보여줄 수 있습니다.",
        ),
        code(
          `import { useState, useTransition } from "react";

function Filter({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(items);
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setQuery(next);
    startTransition(() => {
      setVisible(items.filter((item) => item.includes(next)));
    });
  }

  return (
    <>
      <input value={query} onChange={onChange} />
      {isPending && <p>결과 갱신 중…</p>}
      <ul>
        {visible.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}`,
          "tsx",
          "입력은 즉시, 목록은 Transition",
        ),
        warn(
          "입력 state 자체를 Transition으로 감싸면 글자가 늦게 뜹니다. 사용자가 보는 컨트롤은 긴급 업데이트로 두세요.",
        ),
      ],
    },
    {
      id: "deferred",
      title: "useDeferredValue",
      difficulty: "advanced",
      blocks: [
        p(
          term("usedeferredvalue", "useDeferredValue"),
          "는 “이미 있는 값”을 한 박자 늦게 따라오게 만듭니다. 자식이 무거운데, 부모에서 startTransition을 넣기 어려울 때 유용합니다.",
        ),
        code(
          `function SearchResults({ query }: { query: string }) {
  const deferred = useDeferredValue(query);
  const stale = deferred !== query;

  return (
    <div style={{ opacity: stale ? 0.6 : 1 }}>
      <ExpensiveList query={deferred} />
    </div>
  );
}`,
          "tsx",
          "값을 늦게 전파하기",
        ),
        ul(
          [
            "부모가 query를 이미 갖고 있고, 자식만 무거울 때 → useDeferredValue",
          ],
          [
            "상태 업데이트를 직접 급하지 않음으로 표시할 때 → useTransition",
          ],
          [
            "로딩 경계를 컴포넌트 트리에 둘 때 → ",
            term("suspense", "Suspense"),
          ],
        ),
        info(
          "둘 다 매직 성능 버튼이 아닙니다. 목록이 실제로 메인 스레드를 막을 만큼 클 때 측정 후 도입하세요.",
        ),
        tip(
          inlineCode("isPending"),
          "이나 stale 스타일로 “이전 결과가 잠시 보인다”는 신호를 주면, 양보가 버그가 아니라 의도처럼 느껴집니다.",
        ),
      ],
    },
  ],
};

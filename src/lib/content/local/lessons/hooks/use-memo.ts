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

export const useMemoLesson: Lesson = {
  id: "hooks/use-memo",
  slug: "use-memo",
  title: "useMemo / useCallback",
  description:
    "메모이제이션이 필요한 순간과 남용을 피하는 기준을 정리합니다. useMemo와 useCallback을 한곳에서 비교합니다.",
  category: "hooks",
  difficulty: "intermediate",
  readingTime: "11 min",
  relatedTermSlugs: [
    "usememo",
    "usecallback",
    "memo",
    "hooks",
    "pure-component",
    "render",
  ],
  sections: [
    {
      id: "usememo",
      title: "useMemo — 값 캐시",
      difficulty: "intermediate",
      blocks: [
        p(
          term("usememo", "useMemo"),
          "는 의존성이 이전과 같으면 계산 함수를 다시 실행하지 않고 캐시된 값을 반환합니다. “비싼 계산”이나 “참조 동일성이 필요한 객체/배열”에 씁니다.",
        ),
        code(
          `import { useMemo, useState } from "react";

function FilteredList({ items, query }: { items: string[]; query: string }) {
  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <ul>
      {visible.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}`,
          "tsx",
          "필터 결과 메모",
        ),
        warn(
          "기본 최적화 수단이 아닙니다. 의존성 비교 비용 + 코드 복잡도만 늘리는 경우가 많습니다. 프로필로 “느리다”가 보일 때 넣으세요.",
        ),
        tip(
          "의존성에 넣는 값 자체가 매 렌더 새 참조면 useMemo는 매번 다시 계산합니다. 참조의 출처(Single Source of Truth)를 먼저 안정화하세요.",
        ),
      ],
    },
    {
      id: "usecallback",
      title: "useCallback — 함수 참조 안정화",
      difficulty: "intermediate",
      blocks: [
        p(
          term("usecallback", "useCallback"),
          "은 ",
          inlineCode("useMemo(() => fn, deps)"),
          "와 같습니다. 의존성이 같으면 같은 함수 참조를 유지합니다. 자식이 ",
          term("memo", "memo"),
          "로 감싸져 있거나, Effect 의존성에 함수를 넣을 때 의미가 있습니다.",
        ),
        code(
          `import { memo, useCallback, useState } from "react";

const Row = memo(function Row({
  item,
  onSelect,
}: {
  item: string;
  onSelect: (id: string) => void;
}) {
  return <button onClick={() => onSelect(item)}>{item}</button>;
});

function List({ items }: { items: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const onSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  return (
    <div>
      {items.map((item) => (
        <Row key={item} item={item} onSelect={onSelect} />
      ))}
      <p>선택: {selected}</p>
    </div>
  );
}`,
          "tsx",
          "memo 자식 + useCallback",
        ),
        info(
          "인라인 ",
          inlineCode("onSelect={(id) => ...}"),
          "는 매 렌더 새 함수입니다. memo 자식이 없으면 보통 문제없고, 있으면 최적화가 무력화됩니다.",
        ),
      ],
    },
    {
      id: "when",
      title: "언제 쓰고, 언제 말까",
      difficulty: "intermediate",
      blocks: [
        ul(
          [
            "쓰기: 실제 병목이 측정됨, 큰 리스트 + memo 자식, 참조 안정성이 API 계약",
          ],
          [
            "말기: “일단 감싸두면 빨라지겠지”, 의존성 불안정, 단순 산술",
          ],
          [
            "대안: 상태 ",
            term("state-colocation", "공동배치"),
            "로 리렌더 범위 줄이기, 리스트 가상화, React Compiler",
          ],
        ),
        code(
          `// useCallback ≈ useMemo로 함수 캐시
const onSelect = useCallback((id: string) => {
  setSelected(id);
}, []);

const onSelectMemo = useMemo(
  () => (id: string) => setSelected(id),
  [],
);`,
          "tsx",
          "둘의 관계",
        ),
        tip(
          term("pure-component", "순수 렌더"),
          "를 지키는 것이 메모이제이션보다 우선입니다. 순수하지 않은 컴포넌트에 memo를 얹으면 버그만 숨깁니다.",
        ),
        warn(
          "모든 핸들러를 useCallback으로 감싸는 습관은 피하세요. 팀 가독성을 해치고, 의존성 실수로 stale 버그를 키웁니다.",
        ),
        info(
          term("react-compiler", "React Compiler"),
          "가 켜진 프로젝트에서는 이 훅들을 “기본 방어”로 쓰지 마세요. 측정된 병목, 또는 참조 동일성이 외부 계약인 자리에만 남깁니다.",
        ),
      ],
    },
  ],
};

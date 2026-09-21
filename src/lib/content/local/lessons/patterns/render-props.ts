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

export const renderPropsLesson: Lesson = {
  id: "patterns/render-props",
  slug: "render-props",
  title: "Render Props",
  description:
    "렌더 로직을 주입해 동작을 확장하는 고전 패턴을 복습합니다. 현대에는 커스텀 훅으로 대체되는 경우가 많습니다.",
  category: "patterns",
  difficulty: "intermediate",
  readingTime: "9 min",
  relatedTermSlugs: [
    "render-props",
    "custom-hook",
    "component",
    "props",
  ],
  sections: [
    {
      id: "pattern",
      title: "함수로 UI를 주입하기",
      difficulty: "intermediate",
      blocks: [
        p(
          term("render-props", "Render Props"),
          "는 “무엇을 그릴지”를 함수 ",
          term("props", "prop"),
          "으로 받아, 동작(마우스 위치, 데이터 로딩 상태 등)은 공유하고 UI는 호출부가 결정하는 패턴입니다.",
        ),
        code(
          `function Mouse({
  render,
}: {
  render: (pos: { x: number; y: number }) => React.ReactNode;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return <>{render(pos)}</>;
}

// 사용
<Mouse render={({ x, y }) => <p>좌표: {x}, {y}</p>} />`,
          "tsx",
          "고전 Mouse 예제",
        ),
        tip(
          inlineCode("children"),
          "이 함수인 경우도 Render Props입니다. ",
          inlineCode("<Mouse>{(pos) => ...}</Mouse>"),
          " 형태가 흔했습니다.",
        ),
      ],
    },
    {
      id: "vs-hooks",
      title: "커스텀 훅과의 관계",
      difficulty: "intermediate",
      blocks: [
        p(
          "같은 관심사를 ",
          term("custom-hook", "커스텀 훅"),
          "으로 옮기면 래퍼 컴포넌트 없이 로직만 가져올 수 있습니다. 트리 깊이와 래퍼 hell이 줄어듭니다.",
        ),
        code(
          `function useMouse() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

function Spot() {
  const { x, y } = useMouse();
  return <p>좌표: {x}, {y}</p>;
}`,
          "tsx",
          "훅으로 바꾼 버전",
        ),
        info(
          "레거시 코드·라이브러리 API·“슬롯에 상태를 주입해야 하는 UI”에서는 여전히 Render Props가 보입니다. 원리를 알면 읽기가 수월합니다.",
        ),
      ],
    },
    {
      id: "pitfalls",
      title: "주의점",
      difficulty: "basic",
      blocks: [
        ul(
          [
            "매 렌더 새 인라인 함수 → 자식 최적화와 충돌할 수 있음",
          ],
          [
            "중첩 Render Props는 가독성이 급격히 하락(콜백 지옥)",
          ],
          [
            "TypeScript 제네릭이 조금만 복잡해져도 타입이 장황해짐",
          ],
        ),
        warn(
          "신규 기능에서는 기본적으로 커스텀 훅을 먼저 검토하세요. Render Props는 “UI 주입이 꼭 필요한가?”에 yes일 때의 도구입니다.",
        ),
      ],
    },
  ],
};

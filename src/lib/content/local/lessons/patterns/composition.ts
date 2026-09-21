import type { Lesson } from "@/types/lesson";
import {
  p,
  ul,
  code,
  tip,
  warn,
  term,
  inlineCode,
} from "@/lib/content/helpers";

export const compositionLesson: Lesson = {
  id: "patterns/composition",
  slug: "composition",
  title: "합성 (Composition)",
  description:
    "상속 대신 children·슬롯·작은 컴포넌트 조합으로 UI를 확장하는 방법입니다. React가 권장하는 기본 조립법입니다.",
  category: "patterns",
  difficulty: "basic",
  readingTime: "9 min",
  relatedTermSlugs: [
    "composition",
    "component",
    "props",
    "compound-components",
  ],
  sections: [
    {
      id: "slots",
      title: "children과 슬롯",
      difficulty: "basic",
      blocks: [
        p(
          "React의 기본 확장 방법은 상속이 아니라 ",
          term("composition", "합성"),
          "입니다. 부모는 뼈대를 두고, 호출하는 쪽이 ",
          inlineCode("children"),
          "이나 이름 있는 슬롯으로 내용을 채웁니다.",
        ),
        code(
          `function Panel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        {actions}
      </header>
      <div>{children}</div>
    </section>
  );
}

<Panel title="이슈" actions={<button>새로 만들기</button>}>
  <IssueList />
</Panel>`,
          "tsx",
          "이름 있는 슬롯 + children",
        ),
        ul(
          [
            inlineCode("children"),
            ": 본문 영역. 가장 흔한 합성",
          ],
          [
            "이름 있는 슬롯(",
            inlineCode("actions"),
            ", ",
            inlineCode("footer"),
            "): 자리가 여러 곳일 때",
          ],
          [
            term("compound-components", "Compound"),
            ": 슬롯이 문법이 되고 내부 상태를 공유할 때",
          ],
        ),
        warn(
          "모든 변형을 props 불리언으로 열지 마세요. ",
          inlineCode("isCompact"),
          ", ",
          inlineCode("showFooter"),
          ", ",
          inlineCode("variant={20개}"),
          "는 합성으로 푸는 편이 읽기 쉽습니다.",
        ),
        tip(
          "“이 컴포넌트를 상속해서 조금만 바꾸자”는 신호가 보이면, 먼저 children/슬롯으로 구멍을 열어 보세요. React 클래스를 extends 하는 패턴은 거의 필요가 없습니다.",
        ),
        p(
          "합성과 ",
          term("custom-hook", "커스텀 훅"),
          "은 층을 나눕니다. 훅은 동작(구독, 폼, 권한)을 공유하고, 합성은 화면 배치를 공유합니다. 둘을 한 거대한 HOC에 넣지 마세요.",
        ),
      ],
    },
  ],
};

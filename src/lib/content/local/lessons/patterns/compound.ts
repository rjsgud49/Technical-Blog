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

export const compoundLesson: Lesson = {
  id: "patterns/compound",
  slug: "compound",
  title: "Compound Components",
  description:
    "암묵적 상태 공유로 유연한 API를 만드는 패턴입니다. Select·Tabs·Accordion처럼 조합형 UI에 잘 맞습니다.",
  category: "patterns",
  difficulty: "intermediate",
  readingTime: "11 min",
  relatedTermSlugs: [
    "compound-components",
    "context",
    "component",
    "props",
  ],
  sections: [
    {
      id: "idea",
      title: "합성으로 API 만들기",
      difficulty: "intermediate",
      blocks: [
        p(
          term("compound-components", "Compound Components"),
          "는 부모와 자식이 한 세트처럼 조합되며, 상태는 부모가 조율하고 자식은 마크업 위치를 유연하게 배치하는 패턴입니다. HTML의 ",
          inlineCode("<select>"),
          " + ",
          inlineCode("<option>"),
          " 관계를 React로 재현한다고 보면 쉽습니다.",
        ),
        code(
          `function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ index, children }: { index: number; children: React.ReactNode }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={active === index}
      onClick={() => setActive(index)}
    >
      {children}
    </button>
  );
}

// 사용
<Tabs>
  <TabList>
    <Tab index={0}>프로필</Tab>
    <Tab index={1}>설정</Tab>
  </TabList>
</Tabs>`,
          "tsx",
          "Tabs 합성 API",
        ),
        tip(
          "호출부는 레이아웃을 자유롭게 짜고, 동작 규칙은 루트가 가집니다. props로 모든 슬롯을 강제하는 것보다 DX가 좋은 경우가 많습니다.",
        ),
      ],
    },
    {
      id: "context",
      title: "암묵적 공유와 Context",
      difficulty: "intermediate",
      blocks: [
        p(
          "자식이 부모 state에 접근하려면 보통 ",
          term("context", "Context"),
          "를 씁니다. props drilling 없이 ",
          inlineCode("Tabs.Tab"),
          "이 활성 인덱스를 읽을 수 있습니다.",
        ),
        ul(
          ["루트: state + Provider"],
          ["자식: useContext로 구독, UI만 담당"],
          ["정적 속성으로 ", inlineCode("Tabs.Tab = Tab"), " 노출해 한 네임스페이스로"],
        ),
        warn(
          "Provider value가 자주 바뀌면 모든 구독 자식이 리렌더됩니다. 탭 콘텐츠가 무거우면 활성 패널만 마운트하거나 memo로 경계를 나누세요.",
        ),
        info(
          "React.Children.map으로 자식을 클론해 props를 주입하는 방식도 있지만, Context보다 깨지기 쉽고 TypeScript와 궁합이 나쁩니다. 신규 코드는 Context를 우선하세요.",
        ),
      ],
    },
    {
      id: "tradeoffs",
      title: "장단점과 대안",
      difficulty: "advanced",
      blocks: [
        ul(
          ["장점: 유연한 마크업, 응집된 동작, 선언적 사용처"],
          ["단점: 암묵적 의존, 문서화 필요, 잘못된 자식 조합 가능"],
          [
            "대안: headless 훅(",
            inlineCode("useTabs()"),
            ") + 완전 제어 UI",
          ],
        ),
        code(
          `// headless: 로직만 훅으로, UI는 호출부가 그림
function useTabs(initial = 0) {
  const [active, setActive] = useState(initial);
  return { active, setActive, isActive: (i: number) => active === i };
}`,
          "tsx",
          "Compound vs Headless",
        ),
        tip(
          "디자인 시스템 컴포넌트(Modal, Menu, Accordion)에서 Compound가 특히 빛납니다. 앱 화면 한두 곳에서만 쓰면 오버엔지니어링일 수 있습니다.",
        ),
      ],
    },
  ],
};

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

export const hocLesson: Lesson = {
  id: "patterns/hoc",
  slug: "hoc",
  title: "Higher-Order Component",
  description:
    "컴포넌트를 감싸 기능을 합성하는 HOC의 장단점을 정리합니다. 왜 훅이 더 선호되는지 이해합니다.",
  category: "patterns",
  difficulty: "intermediate",
  readingTime: "9 min",
  relatedTermSlugs: [
    "hoc",
    "custom-hook",
    "component",
    "props",
    "memo",
  ],
  sections: [
    {
      id: "what",
      title: "HOC란",
      difficulty: "intermediate",
      blocks: [
        p(
          term("hoc", "HOC"),
          "(Higher-Order Component)는 컴포넌트를 받아 기능을 더한 컴포넌트를 반환하는 함수입니다. ",
          inlineCode("withAuth(Page)"),
          ", ",
          inlineCode("withRouter(Comp)"),
          "처럼 “감싸서 보강”하는 형태가 전형적입니다.",
        ),
        code(
          `function withLoading<P extends object>(
  Wrapped: React.ComponentType<P & { loading: boolean }>,
) {
  return function WithLoading(props: P & { loading: boolean }) {
    if (props.loading) return <p>로딩…</p>;
    return <Wrapped {...props} />;
  };
}

const UserCard = withLoading(function UserCard({
  name,
}: {
  name: string;
  loading: boolean;
}) {
  return <article>{name}</article>;
});`,
          "tsx",
          "withLoading HOC",
        ),
        tip(
          "표시 이름은 ",
          inlineCode("WithLoading(UserCard)"),
          "처럼 남겨 두면 DevTools에서 디버깅이 쉬워집니다.",
        ),
      ],
    },
    {
      id: "problems",
      title: "왜 훅으로 옮겨졌나",
      difficulty: "intermediate",
      blocks: [
        ul(
          ["props 이름 충돌 — HOC가 주입한 prop과 호출부 prop이 겹침"],
          ["래핑 지옥 — withA(withB(withC(Comp))) 가독성 저하"],
          ["정적 타입·ref 전달이 번거로움"],
          ["로직만 필요한데 트리에 노드가 늘어남"],
        ),
        code(
          `// HOC
export default withAuth(withTheme(Profile));

// 훅
function Profile() {
  const user = useAuth();
  const theme = useTheme();
  return <div data-theme={theme}>{user.name}</div>;
}`,
          "tsx",
          "같은 관심사, 다른 형태",
        ),
        warn(
          "신규 코드에서는 ",
          term("custom-hook", "커스텀 훅"),
          "을 기본으로 하세요. HOC는 레거시·특정 라이브러리 제약·",
          term("memo", "memo"),
          "처럼 프레임워크가 제공하는 경우에 주로 남습니다.",
        ),
      ],
    },
    {
      id: "when",
      title: "여전히 쓸 만한 경우",
      difficulty: "basic",
      blocks: [
        info(
          inlineCode("React.memo"),
          " 자체가 HOC입니다. “컴포넌트 전체를 감싸 행동을 바꾸는” 프레임워크 API로는 여전히 유효합니다.",
        ),
        p(
          "권한 가드처럼 라우트 단위로 페이지를 감싸야 하고, 훅을 넣을 위치가 애매한 레거시 클래스 컴포넌트 경계에서는 HOC가 실용적일 수 있습니다. 다만 장기적으로는 훅·레이아웃 컴포넌트로 이전하는 편이 낫습니다.",
        ),
        tip(
          "HOC를 유지해야 한다면 주입 props를 한 객체로 네임스페이스하거나, prop 이름을 문서화·타입으로 강제하세요.",
        ),
      ],
    },
  ],
};

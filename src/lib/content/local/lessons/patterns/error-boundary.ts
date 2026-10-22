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

export const errorBoundaryLesson: Lesson = {
  id: "patterns/error-boundary",
  slug: "error-boundary",
  title: "Error Boundary",
  description:
    "렌더 에러를 흰 화면 대신 폴백으로 바꾸는 패턴입니다. 어디까지 잡고, 어디에 경계를 둘지 기준을 잡습니다.",
  category: "patterns",
  difficulty: "intermediate",
  readingTime: "10 min",
  relatedTermSlugs: ["error-boundary", "component", "suspense"],
  sections: [
    {
      id: "scope",
      title: "경계를 위젯 단위로",
      difficulty: "intermediate",
      blocks: [
        p(
          term("error-boundary", "Error Boundary"),
          "는 자식 트리의 렌더 예외를 잡아 폴백 UI를 렌더합니다. 앱 루트 하나면 위젯 하나가 죽어도 전체가 내려갑니다. 피드, 에디터, 사이드바처럼 독립된 영역마다 감싸세요.",
        ),
        code(
          `class WidgetBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function Page() {
  return (
    <>
      <WidgetBoundary fallback={<p>목록을 불러오지 못했습니다</p>}>
        <Feed />
      </WidgetBoundary>
      <WidgetBoundary fallback={<p>채팅을 표시할 수 없습니다</p>}>
        <Chat />
      </WidgetBoundary>
    </>
  );
}`,
          "tsx",
          "영역마다 다른 폴백",
        ),
        ul(
          ["잡힘: 렌더, 자식 Hook 실행, 생명주기"],
          ["안 잡힘: 이벤트 핸들러, Promise, setTimeout, 서버 컴포넌트 자체 예외"],
          [
            "로딩은 ",
            term("suspense", "Suspense"),
            ", 실패 복구는 Error Boundary — 역할을 나누세요",
          ],
        ),
        warn(
          "이벤트 핸들러 에러는 try/catch나 전역 핸들러가 필요합니다. 경계를 넣었다고 클릭 핸들러까지 안전해지지 않습니다.",
        ),
        tip(
          "react-error-boundary 같은 래퍼는 클래스 보일러플레이트를 줄여 줍니다. 핵심 계약(폴백 + 로깅 + 리셋)은 같습니다.",
        ),
        info(
          inlineCode("resetKeys"),
          "로 라우트/id가 바뀌면 경계를 리셋하세요. 한 번 에러 상태가 되면 자식은 다시 시도하지 않습니다.",
        ),
      ],
    },
  ],
};

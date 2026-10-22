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

export const useEffectLesson: Lesson = {
  id: "hooks/use-effect",
  slug: "use-effect",
  title: "useEffect",
  description:
    "동기화 관점으로 Effect를 보고, 의존성·클린업을 올바르게 씁니다. Effect에 넣지 말아야 할 것도 함께 정리합니다.",
  category: "hooks",
  difficulty: "basic",
  readingTime: "12 min",
  relatedTermSlugs: [
    "useeffect",
    "hooks",
    "cleanup",
    "commit",
    "side-effect",
    "rules-of-hooks",
  ],
  sections: [
    {
      id: "mental-model",
      title: "Effect = 외부와 동기화",
      difficulty: "basic",
      blocks: [
        p(
          term("useeffect", "useEffect"),
          "는 렌더 결과와 외부 시스템(",
          term("side-effect", "부수 효과"),
          ")을 맞추는 Hook입니다. 네트워크, 브라우저 API, 구독, 비React 위젯이 대표 대상입니다.",
        ),
        p(
          "Effect는 ",
          term("commit", "커밋"),
          " 이후(페인트 후)에 실행됩니다. 렌더 본문은 순수 계산에 가깝게 두고, “화면이 이렇게 됐으니 바깥 세계도 이렇게”를 Effect에 적습니다.",
        ),
        code(
          `import { useEffect, useState } from "react";

function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}`,
          "tsx",
          "문서 제목 동기화",
        ),
        tip(
          "데이터 페칭만 생각하기 쉽지만, “props/state → 외부 세계” 동기화가 더 정확한 정의입니다. 페칭은 그 한 사례일 뿐입니다.",
        ),
      ],
    },
    {
      id: "deps-cleanup",
      title: "의존성과 클린업",
      difficulty: "basic",
      blocks: [
        p(
          "의존성 배열에 넣은 값이 바뀌면 Effect를 다시 실행합니다. 빈 배열 ",
          inlineCode("[]"),
          "은 마운트 시 한 번(Strict Mode에서는 개발 중 두 번 검사)에 가깝게 동작합니다. 배열을 생략하면 매 렌더마다 실행됩니다.",
        ),
        ol(
          [
            "이전 Effect의 ",
            term("cleanup", "클린업"),
            " 실행 (있다면)",
          ],
          ["새 Effect 실행"],
          ["언마운트 시에도 마지막 클린업 실행"],
        ),
        code(
          `function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const conn = connect(roomId);
    conn.join();

    return () => {
      conn.leave(); // 방 바뀌거나 언마운트 시 정리
    };
  }, [roomId]);

  return <p>{roomId} 접속 중</p>;
}`,
          "tsx",
          "구독 + cleanup",
        ),
        warn(
          "클린업을 빼면 방 전환 시 구독이 쌓이거나, 언마운트 후 setState로 경고가 납니다. 타이머·WebSocket·이벤트 리스너는 반드시 해제하세요.",
        ),
        info(
          "eslint-plugin-react-hooks의 exhaustive-deps는 잔소리처럼 보여도, stale closure(오래된 클로저) 버그를 막는 데 실질적으로 도움이 됩니다.",
        ),
      ],
    },
    {
      id: "anti-patterns",
      title: "Effect에 넣지 말 것",
      difficulty: "intermediate",
      blocks: [
        ul(
          [
            "props/state로 바로 계산 가능한 파생 값 → 렌더 중 계산",
          ],
          [
            "사용자 클릭에 대한 응답 → 이벤트 핸들러",
          ],
          [
            "부모에 데이터를 알리기 위한 ",
            inlineCode("onChange"),
            " 연쇄 → 구조를 다시 설계",
          ],
        ),
        code(
          `// ❌ 렌더 → Effect → setState → 또 렌더 (연쇄)
useEffect(() => {
  setFullName(first + " " + last);
}, [first, last]);

// ✅
const fullName = first + " " + last;`,
          "tsx",
          "파생 값을 Effect로 동기화하지 않기",
        ),
        tip(
          "“마운트 시 한 번만”이 목적이어도, 현대 React에서는 데이터 로딩을 프레임워크(",
          term("nextjs", "Next.js"),
          ")·라이브러리·",
          term("rsc", "RSC"),
          "에 맡기는 편이 더 안전할 때가 많습니다.",
        ),
        p(
          term("rules-of-hooks", "Rules of Hooks"),
          "를 지키지 않으면 Effect 호출 순서가 깨져 전혀 다른 Effect가 잘못된 Fiber에 연결될 수 있습니다. 조건부로 Hook을 호출하지 마세요.",
        ),
      ],
    },
    {
      id: "data-fetching",
      title: "데이터 로딩을 Effect에 둘 때",
      difficulty: "advanced",
      blocks: [
        p(
          "클라이언트에서 반드시 fetch해야 한다면, race(경쟁)와 취소를 같이 설계합니다. 빠른 응답이 느린 응답보다 늦게 도착하면 이전 요청이 최신 화면을 덮어씁니다.",
        ),
        code(
          `useEffect(() => {
  const ac = new AbortController();
  let cancelled = false;

  async function load() {
    const res = await fetch(\`/api/users/\${id}\`, { signal: ac.signal });
    const data = await res.json();
    if (!cancelled) setUser(data);
  }

  void load();
  return () => {
    cancelled = true;
    ac.abort();
  };
}, [id]);`,
          "tsx",
          "AbortController로 경쟁 상태 막기",
        ),
        ul(
          [
            "가능하면 ",
            term("rsc", "RSC"),
            "·로더·TanStack Query처럼 캐시·재시도·중복 제거가 있는 층을 쓴다",
          ],
          [
            "Effect fetch는 “외부 시스템 동기화”가 맞을 때만 — 검색어 디바운스 후 요청 등",
          ],
          [
            "로딩/에러 UI는 컴포넌트 state 또는 ",
            term("suspense", "Suspense"),
            " 경계로 선언",
          ],
        ),
        warn(
          "id가 바뀔 때마다 Effect가 다시 돌고, 이전 요청을 취소하지 않으면 화면이 과거 데이터로 깜빡입니다. 의존성에 id를 넣고, 클린업에서 abort 하세요.",
        ),
      ],
    },
  ],
};

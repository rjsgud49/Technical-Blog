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

export const useSyncExternalStoreLesson: Lesson = {
  id: "hooks/use-sync-external-store",
  slug: "use-sync-external-store",
  title: "useSyncExternalStore",
  description:
    "React 바깥 저장소(브라우저 API, 외부 스토어)를 구독하는 공식 Hook입니다. Concurrent 렌더와 tear 없는 스냅샷을 맞춥니다.",
  category: "hooks",
  difficulty: "advanced",
  readingTime: "10 min",
  relatedTermSlugs: [
    "usesyncexternalstore",
    "hooks",
    "concurrent",
    "state",
  ],
  sections: [
    {
      id: "subscribe",
      title: "외부 스토어를 안전하게 읽기",
      difficulty: "advanced",
      blocks: [
        p(
          term("usesyncexternalstore", "useSyncExternalStore"),
          "는 React가 관리하지 않는 데이터 소스를 렌더에 연결합니다. Zustand·Redux 같은 라이브러리의 내부 구현이기도 하고, ",
          inlineCode("window.matchMedia"),
          " · online/offline · 외부 이벤트 버스에도 씁니다.",
        ),
        p(
          "왜 ",
          term("useeffect", "useEffect"),
          " + ",
          inlineCode("useState"),
          "로 구독하면 부족할까요. Concurrent 렌더에서는 한 커밋이 끝나기 전에 스토어가 바뀔 수 있어, 한 화면의 다른 컴포넌트가 서로 다른 스냅샷을 읽는 tearing이 납니다. 이 Hook은 구독·스냅샷·서버 스냅샷을 한 계약으로 묶습니다.",
        ),
        code(
          `function subscribe(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function useOnline() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}`,
          "tsx",
          "온라인 여부를 외부 스토어처럼",
        ),
        ul(
          [
            inlineCode("subscribe"),
            ": 변경 시 onStoreChange 호출, 클린업 반환",
          ],
          [
            inlineCode("getSnapshot"),
            ": 현재 값. 참조가 자주 바뀌면 무한 리렌더",
          ],
          [
            inlineCode("getServerSnapshot"),
            ": SSR 시 클라이언트 첫 페인트와 맞출 값",
          ],
        ),
        warn(
          "getSnapshot이 매번 새 객체 ",
          inlineCode("{ ... }"),
          "를 반환하면 React는 항상 바뀌었다고 봅니다. 원시 값이거나, 저장소가 같은 참조를 재사용해야 합니다.",
        ),
        info(
          "대부분의 앱 코드는 이 Hook을 직접 쓰기보다, 상태 라이브러리가 감싼 결과를 씁니다. 직접 써야 하는 경우는 “브라우저/전역이 진실의 원천”일 때입니다.",
        ),
        tip(
          "이 사이트의 목차·로그인 상태처럼 외부 스토어를 구독하는 코드가 있다면, Effect로 setState 하기보다 useSyncExternalStore 계약을 지키는 편이 Concurrent와 SSR에 안전합니다.",
        ),
      ],
    },
  ],
};

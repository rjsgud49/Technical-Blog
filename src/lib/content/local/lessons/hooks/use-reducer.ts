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

export const useReducerLesson: Lesson = {
  id: "hooks/use-reducer",
  slug: "use-reducer",
  title: "useReducer",
  description:
    "복잡한 상태 전이를 예측 가능한 액션 단위로 모델링합니다. useState와 언제 갈아탈지 기준을 잡습니다.",
  category: "hooks",
  difficulty: "intermediate",
  readingTime: "10 min",
  relatedTermSlugs: [
    "usereducer",
    "usestate",
    "state",
    "hooks",
    "batching",
  ],
  sections: [
    {
      id: "when",
      title: "언제 useReducer인가",
      difficulty: "intermediate",
      blocks: [
        p(
          term("usereducer", "useReducer"),
          "는 ",
          inlineCode("(state, action) => nextState"),
          " 리듀서로 ",
          term("state", "state"),
          "를 갱신합니다. 필드가 여러 개이고 전이가 “이벤트”로 설명될 때 ",
          term("usestate", "useState"),
          "보다 읽기 쉽습니다.",
        ),
        ul(
          ["다음 state가 이전 state에 강하게 의존"],
          ["한 이벤트에 여러 필드를 함께 갱신"],
          ["같은 전이 로직을 테스트·재사용하고 싶음"],
        ),
        code(
          `type State = { status: "idle" | "loading" | "error"; data: string | null; error: string | null };
type Action =
  | { type: "fetch" }
  | { type: "success"; data: string }
  | { type: "fail"; error: string }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetch":
      return { status: "loading", data: null, error: null };
    case "success":
      return { status: "idle", data: action.data, error: null };
    case "fail":
      return { status: "error", data: null, error: action.error };
    case "reset":
      return { status: "idle", data: null, error: null };
    default:
      return state;
  }
}`,
          "tsx",
          "액션으로 전이 표현",
        ),
        tip(
          "리듀서는 순수 함수로 두세요. 네트워크·토스트는 dispatch 전후 이벤트 핸들러나 Effect에서 처리합니다.",
        ),
      ],
    },
    {
      id: "usage",
      title: "사용법과 패턴",
      difficulty: "intermediate",
      blocks: [
        code(
          `function Loader() {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle",
    data: null,
    error: null,
  });

  async function load() {
    dispatch({ type: "fetch" });
    try {
      const data = await fetchText();
      dispatch({ type: "success", data });
    } catch (e) {
      dispatch({ type: "fail", error: String(e) });
    }
  }

  return (
    <div>
      <button onClick={load} disabled={state.status === "loading"}>
        불러오기
      </button>
      {state.error && <p>{state.error}</p>}
      {state.data && <pre>{state.data}</pre>}
    </div>
  );
}`,
          "tsx",
          "dispatch로 UI 연결",
        ),
        ol(
          [
            "초기 state 객체 정의",
          ],
          [
            "액션 타입을 유니온으로 좁히기",
          ],
          [
            "switch에서 빠짐없이 next state 반환",
          ],
          [
            "컴포넌트는 의도에 가까운 ",
            inlineCode("dispatch({ type })"),
            "만 호출",
          ],
        ),
        info(
          "초기화가 복잡하면 ",
          inlineCode("useReducer(reducer, arg, init)"),
          " 형태의 lazy init을 사용할 수 있습니다. 마운트 시 ",
          inlineCode("init(arg)"),
          "만 실행됩니다.",
        ),
      ],
    },
    {
      id: "vs-usestate",
      title: "useState와의 관계",
      difficulty: "basic",
      blocks: [
        p(
          "둘 다 같은 스케줄러 위에서 동작하며 ",
          term("batching", "batching"),
          "도 동일합니다. “더 고급”이 아니라 “표현력의 다른 축”입니다. 단순한 on/off·카운터는 useState가 더 짧습니다.",
        ),
        warn(
          "리듀서 안에서 또 다른 setState를 호출하거나 부수 효과를 넣지 마세요. 디버깅이 어려워지고 Concurrent 렌더와 충돌할 수 있습니다.",
        ),
        tip(
          "여러 컴포넌트가 같은 전이 규칙을 쓰면 리듀서+Context로 올리거나, ",
          term("custom-hook", "커스텀 훅"),
          "으로 ",
          inlineCode("const [state, dispatch] = useX()"),
          "를 노출하세요.",
        ),
      ],
    },
  ],
};

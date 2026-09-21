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

export const customHooksLesson: Lesson = {
  id: "hooks/custom-hooks",
  slug: "custom-hooks",
  title: "커스텀 훅",
  description:
    "로직 재사용 단위로서의 훅 설계와 Rules of Hooks를 다룹니다. HOC·Render Props를 대체하는 현대적 방법을 익힙니다.",
  category: "hooks",
  difficulty: "advanced",
  readingTime: "12 min",
  relatedTermSlugs: [
    "custom-hook",
    "hooks",
    "rules-of-hooks",
    "useeffect",
    "usestate",
    "hoc",
    "render-props",
  ],
  sections: [
    {
      id: "what",
      title: "커스텀 훅이란",
      difficulty: "advanced",
      blocks: [
        p(
          term("custom-hook", "커스텀 훅"),
          "은 ",
          inlineCode("use"),
          "로 시작하는 함수로, 다른 ",
          term("hooks", "Hooks"),
          "를 조합해 로직을 이름 있는 단위로 추출한 것입니다. 새로운 React 기능이 아니라 조합 패턴입니다.",
        ),
        p(
          "컴포넌트에서 “어떻게 그릴지”와 “어떤 상태를 유지·동기화할지”가 섞이면 읽기 어려워집니다. 후자를 훅으로 빼면 UI는 얇아지고, 같은 로직을 여러 화면에서 재사용할 수 있습니다.",
        ),
        code(
          `function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}

function StatusBadge() {
  const online = useOnlineStatus();
  return <span>{online ? "온라인" : "오프라인"}</span>;
}`,
          "tsx",
          "구독 로직 추출",
        ),
        tip(
          "이름이 ",
          inlineCode("use"),
          "로 시작해야 린트가 Rules of Hooks를 적용합니다. ",
          inlineCode("getOnlineStatus"),
          "처럼 지으면 Hook 호출이 숨겨져 규칙 검사가 깨집니다.",
        ),
      ],
    },
    {
      id: "rules",
      title: "Rules of Hooks 다시 보기",
      difficulty: "intermediate",
      blocks: [
        p(
          term("rules-of-hooks", "Rules of Hooks"),
          "는 커스텀 훅 안에서도 동일합니다. Hook 호출 순서가 매 렌더 같아야 Fiber의 Hook 리스트와 인덱스가 맞습니다.",
        ),
        ul(
          ["최상위(조건·반복·중첩 함수 밖)에서만 호출"],
          ["React 함수 컴포넌트 또는 커스텀 훅 안에서만 호출"],
          ["커스텀 훅이 다른 커스텀 훅을 호출하는 것은 OK"],
        ),
        warn(
          "조건부로 ",
          inlineCode("useEffect"),
          "를 호출하지 말고, Effect 안에서 early return 하거나 의존성으로 동작을 제어하세요.",
        ),
        code(
          `// ❌
function useMaybe(flag: boolean) {
  if (!flag) return null;
  const [v, setV] = useState(0); // 조건부 Hook
  return v;
}

// ✅
function useMaybe(flag: boolean) {
  const [v, setV] = useState(0);
  if (!flag) return null;
  return v;
}`,
          "tsx",
          "조건부 Hook 금지",
        ),
      ],
    },
    {
      id: "design",
      title: "API 설계와 대안",
      difficulty: "advanced",
      blocks: [
        ol(
          [
            "입력: 최소 props/옵션. 과한 설정 객체는 호출부를 읽기 어렵게 만듦",
          ],
          [
            "출력: 값 + 액션을 튜플/객체로. 팀 컨벤션을 하나로 통일",
          ],
          [
            "부수 효과: ",
            term("cleanup", "클린업"),
            "까지 훅 안에 캡슐화",
          ],
          [
            "테스트: 리듀서·순수 함수는 훅 밖으로 빼기 쉬움",
          ],
        ),
        info(
          "과거 ",
          term("hoc", "HOC"),
          "·",
          term("render-props", "Render Props"),
          "로 공유하던 로직은 대부분 커스텀 훅으로 옮겨졌습니다. UI 트리 래핑 없이 로직만 공유할 수 있기 때문입니다.",
        ),
        code(
          `function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((v) => !v);
  const setTrue = () => setOn(true);
  const setFalse = () => setOn(false);
  return { on, toggle, setTrue, setFalse } as const;
}`,
          "tsx",
          "작은 단위의 좋은 예",
        ),
        tip(
          "한 훅이 너무 많은 책임을 지면 ",
          inlineCode("useForm"),
          " + ",
          inlineCode("useFormValidation"),
          "처럼 나누세요. 컴포넌트와 같은 “한 가지 이유” 원칙이 적용됩니다.",
        ),
      ],
    },
  ],
};

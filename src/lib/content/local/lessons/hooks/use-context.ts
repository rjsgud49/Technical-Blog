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

export const useContextLesson: Lesson = {
  id: "hooks/use-context",
  slug: "use-context",
  title: "useContext",
  description:
    "컨텍스트로 트리를 관통하는 값을 공유하고, 리렌더를 관리합니다. props drilling 해소와 전역 상태의 경계를 구분합니다.",
  category: "hooks",
  difficulty: "intermediate",
  readingTime: "10 min",
  relatedTermSlugs: [
    "usecontext",
    "context",
    "hooks",
    "props",
    "render",
    "state",
  ],
  sections: [
    {
      id: "basics",
      title: "Context와 useContext",
      difficulty: "intermediate",
      blocks: [
        p(
          term("context", "Context"),
          "는 중간 컴포넌트에 ",
          term("props", "props"),
          "를 일일이 넘기지 않고 값을 전달하는 메커니즘입니다. ",
          term("usecontext", "useContext"),
          "는 가장 가까운 Provider의 현재 값을 구독합니다.",
        ),
        code(
          `import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<Theme>("light");

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
        테마 전환
      </button>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedBox() {
  const theme = useContext(ThemeContext);
  return <div data-theme={theme}>현재: {theme}</div>;
}`,
          "tsx",
          "테마 Context",
        ),
        tip(
          "테마, 로케일, 인증 세션처럼 “트리 깊숙이 넓게 읽히는 값”에 적합합니다. 매 키 입력마다 바뀌는 폼 값은 Context에 넣지 마세요.",
        ),
      ],
    },
    {
      id: "rerender",
      title: "리렌더와 분리",
      difficulty: "intermediate",
      blocks: [
        p(
          "Provider의 ",
          inlineCode("value"),
          "가 바뀌면 그 Context를 구독하는 모든 자손이 리렌더됩니다. value에 매 렌더 새 객체를 넣으면 구독자가 불필요하게 자주 갱신됩니다.",
        ),
        code(
          `// ❌ 매 렌더 새 객체 → 구독자 전부 리렌더
<AuthContext.Provider value={{ user, login, logout }}>

// ✅ value를 메모하거나 state/reducer로 안정화
const value = useMemo(
  () => ({ user, login, logout }),
  [user, login, logout],
);
<AuthContext.Provider value={value}>`,
          "tsx",
          "value 참조 안정화",
        ),
        ul(
          [
            "자주 바뀌는 값과 안 바뀌는 액션을 Context로 분리",
          ],
          [
            "구독 범위를 줄이려면 컴포넌트를 쪼개 Provider 아래로 내리기",
          ],
          [
            "선택적 구독이 필요하면 상태 라이브러리·외부 store 검토",
          ],
        ),
        warn(
          "Context는 Redux/Zustand 대체재가 아닙니다. 고빈도 업데이트 + 넓은 구독은 성능·복잡도 모두에서 불리합니다.",
        ),
      ],
    },
    {
      id: "design",
      title: "설계 체크리스트",
      difficulty: "advanced",
      blocks: [
        info(
          "기본값은 Provider 밖에서의 fallback입니다. 실수로 Provider를 빼먹으면 침묵한 채 기본값만 쓰이므로, 개발용으로 ",
          inlineCode("null"),
          " 컨텍스트 + 가드 함수 패턴이 흔합니다.",
        ),
        code(
          `const UserContext = createContext<User | null>(null);

function useUser() {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser는 UserProvider 안에서만 사용하세요");
  }
  return user;
}`,
          "tsx",
          "안전한 소비 훅",
        ),
        tip(
          term("compound-components", "Compound Components"),
          "도 내부적으로 Context로 상태를 공유하는 경우가 많습니다. UI API와 데이터 전달을 함께 설계하세요.",
        ),
      ],
    },
  ],
};

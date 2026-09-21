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
} from "@/lib/content/helpers";

export const colocationLesson: Lesson = {
  id: "patterns/colocation",
  slug: "colocation",
  title: "State Colocation",
  description:
    "상태를 필요한 곳에 두어 불필요한 리렌더와 복잡도를 줄입니다. lift state up의 반대 방향도 함께 익힙니다.",
  category: "patterns",
  difficulty: "advanced",
  readingTime: "11 min",
  relatedTermSlugs: [
    "state-colocation",
    "state",
    "render",
    "props",
    "usestate",
  ],
  sections: [
    {
      id: "principle",
      title: "가장 가까운 곳에 두기",
      difficulty: "advanced",
      blocks: [
        p(
          term("state-colocation", "State Colocation"),
          "은 ",
          term("state", "state"),
          "를 실제로 읽고 쓰는 가장 가까운 컴포넌트에 두는 원칙입니다. 위로 올릴수록 리렌더 범위와 props 전달이 커집니다.",
        ),
        p(
          "튜토리얼의 “Lift state up”은 형제 공유가 필요할 때의 기법입니다. 공유가 사라졌는데도 부모가 state를 붙잡고 있으면 과도한 리프팅입니다. 다시 내려보내는 것도 설계입니다.",
        ),
        code(
          `// ❌ 모달 open이 App에 있음 → App 전체가 리렌더
function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HeavyDashboard />
      <button onClick={() => setOpen(true)}>열기</button>
      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}

// ✅ 모달을 쓰는 경계로 이동
function App() {
  return (
    <>
      <HeavyDashboard />
      <ComposeButton />
    </>
  );
}

function ComposeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}`,
          "tsx",
          "모달 state 공동배치",
        ),
        tip(
          "“이 state가 바뀌면 누가 꼭 다시 그려져야 하는가?”를 물어보세요. 답이 좁을수록 좋은 위치입니다.",
        ),
      ],
    },
    {
      id: "practice",
      title: "실전 체크리스트",
      difficulty: "intermediate",
      blocks: [
        ol(
          [
            "한 컴포넌트만 쓰면 → 그 컴포넌트에 두기",
          ],
          [
            "형제가 공유하면 → 공통 조상으로 lift",
          ],
          [
            "트리 멀리까지 필요하면 → Context/URL/서버 상태 검토",
          ],
          [
            "파생 가능하면 → state 제거, ",
            term("render", "렌더"),
            " 중 계산",
          ],
        ),
        warn(
          "전역 스토어에 모든 UI ephemeral state(모달, 드롭다운, 호버)를 넣는 습관은 colocation의 반대입니다. 디버깅과 성능 모두 나빠지기 쉽습니다.",
        ),
        info(
          "URL에 둘 수 있는 상태(필터, 페이지, 탭)는 공유·새로고침·딥링크에 유리합니다. “서버/주소창이 Single Source of Truth”가 되기도 합니다.",
        ),
      ],
    },
    {
      id: "performance",
      title: "성능과의 연결",
      difficulty: "advanced",
      blocks: [
        p(
          "메모이제이션으로 증상을 가리기 전에, state 위치를 옮기면 ",
          term("render", "리렌더"),
          " 자체가 줄어드는 경우가 많습니다. colocation은 최적화이자 가독성 개선입니다.",
        ),
        ul(
          [
            "무거운 자식과 자주 바뀌는 state를 형제로 분리",
          ],
          [
            "children으로 이미 만든 서브트리를 안정적인 부모 아래에 두기",
          ],
          [
            "그래도 병목이면 그때 ",
            term("memo", "memo"),
            " / ",
            term("usememo", "useMemo"),
          ],
        ),
        code(
          `function Parent({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  // query가 바뀌어도 children 참조가 같으면 자식 리렌더를 줄일 수 있음
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {children}
    </div>
  );
}`,
          "tsx",
          "children 패턴으로 경계 나누기",
        ),
      ],
    },
  ],
};

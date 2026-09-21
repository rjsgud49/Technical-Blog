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

export const controlledLesson: Lesson = {
  id: "patterns/controlled",
  slug: "controlled",
  title: "Controlled / Uncontrolled",
  description:
    "폼·입력에서 Single Source of Truth를 어디에 둘지 결정합니다. 제어·비제어의 트레이드오프를 정리합니다.",
  category: "patterns",
  difficulty: "basic",
  readingTime: "9 min",
  relatedTermSlugs: [
    "controlled",
    "uncontrolled",
    "state",
    "usestate",
    "useref",
  ],
  sections: [
    {
      id: "controlled",
      title: "제어 컴포넌트",
      difficulty: "basic",
      blocks: [
        p(
          term("controlled", "제어 컴포넌트"),
          "는 입력 값의 Single Source of Truth가 React ",
          term("state", "state"),
          "에 있는 패턴입니다. ",
          inlineCode("value"),
          " + ",
          inlineCode("onChange"),
          "로 매 키 입력이 state를 거쳐 다시 화면에 반영됩니다.",
        ),
        code(
          `function NameField() {
  const [name, setName] = useState("");
  const tooShort = name.length > 0 && name.length < 2;

  return (
    <label>
      이름
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-invalid={tooShort}
      />
      {tooShort && <span>두 글자 이상 입력하세요</span>}
    </label>
  );
}`,
          "tsx",
          "검증과 함께 쓰는 제어 입력",
        ),
        ul(
          ["실시간 검증·포맷팅·조건부 UI에 유리"],
          ["부모·형제가 같은 값을 읽기 쉬움"],
          ["매 입력마다 리렌더 — 보통은 문제없음"],
        ),
        tip(
          "체크박스·라디오·select도 동일합니다. ",
          inlineCode("checked"),
          " / ",
          inlineCode("value"),
          "를 state와 동기화하세요.",
        ),
      ],
    },
    {
      id: "uncontrolled",
      title: "비제어 컴포넌트",
      difficulty: "basic",
      blocks: [
        p(
          term("uncontrolled", "비제어 컴포넌트"),
          "는 DOM이 값을 소유합니다. 필요할 때 ",
          term("useref", "ref"),
          "로 읽습니다. 기본값은 ",
          inlineCode("defaultValue"),
          " / ",
          inlineCode("defaultChecked"),
          "로 줍니다.",
        ),
        code(
          `function UploadForm() {
  const fileRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    upload(file);
  }

  return (
    <form onSubmit={onSubmit}>
      <input ref={fileRef} type="file" />
      <button type="submit">업로드</button>
    </form>
  );
}`,
          "tsx",
          "파일 input은 비제어가 자연스러움",
        ),
        info(
          "파일 입력, 간단한 “제출 시에만 읽으면 되는” 폼, 비React 위젯 연동에서 비제어가 실용적입니다.",
        ),
      ],
    },
    {
      id: "choose",
      title: "선택 기준과 혼합",
      difficulty: "intermediate",
      blocks: [
        warn(
          inlineCode("value"),
          "와 ",
          inlineCode("defaultValue"),
          "를 섞거나, value만 주고 onChange를 빼면 입력이 멈춘 “읽기 전용”처럼 동작합니다. 제어로 가려면 둘 다 연결하세요.",
        ),
        ul(
          ["입력이 UI 로직을 자주 바꾸면 → 제어"],
          ["제출 때만 값이 필요하면 → 비제어도 OK"],
          ["라이브러리(React Hook Form 등)는 내부적으로 비제어+등록 패턴을 쓰기도 함"],
        ),
        code(
          `// 제어로 “외부에서 값 리셋”이 쉬움
function Search({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}`,
          "tsx",
          "완전히 제어된 검색창",
        ),
        tip(
          "디자인 시스템 input은 가능하면 제어를 기본으로 두고, 고급 사용자에게 ref/defaultValue escape hatch를 제공하는 편이 예측 가능합니다.",
        ),
      ],
    },
  ],
};

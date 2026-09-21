import type { Lesson } from "@/types/lesson";
import {
  p,
  ul,
  code,
  tip,
  warn,
  term,
  inlineCode,
} from "@/lib/content/helpers";

export const useIdLesson: Lesson = {
  id: "hooks/use-id",
  slug: "use-id",
  title: "useId",
  description:
    "SSR과 클라이언트가 같은 ID를 쓰게 만드는 Hook입니다. label–input 연결, aria 속성에 씁니다. 리스트 key가 아닙니다.",
  category: "hooks",
  difficulty: "basic",
  readingTime: "7 min",
  relatedTermSlugs: ["useid", "hooks", "rsc", "accessibility"],
  sections: [
    {
      id: "stable-id",
      title: "하이드레이션과 접근성 ID",
      difficulty: "basic",
      blocks: [
        p(
          term("useid", "useId"),
          "는 컴포넌트 인스턴스마다 안정적인 고유 문자열을 줍니다. 서버에서 그린 HTML과 클라이언트 첫 렌더가 같은 ID를 써야 hydration mismatch가 없습니다.",
        ),
        code(
          `function Field({ label }: { label: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}

function Fieldset() {
  const id = useId();
  return (
    <fieldset aria-describedby={\`\${id}-hint\`}>
      <legend>닉네임</legend>
      <input />
      <p id={\`\${id}-hint\`}>2–12자</p>
    </fieldset>
  );
}`,
          "tsx",
          "label htmlFor와 aria에 useId",
        ),
        ul(
          [
            "✅ 접근성: htmlFor, aria-labelledby, aria-describedby",
          ],
          [
            "✅ 한 페이지에 같은 컴포넌트가 여러 개여도 ID 충돌 없음",
          ],
          [
            "❌ 리스트 ",
            inlineCode("key"),
            "로 쓰지 말 것 — key는 데이터 정체성",
          ],
          [
            "❌ ",
            inlineCode("Math.random()"),
            " / ",
            inlineCode("Date.now()"),
            "로 ID를 만들면 서버·클라이언트가 어긋남",
          ],
        ),
        warn(
          "CSS 선택자나 쿼리 파라미터에 useId 값을 의존하지 마세요. 콜론이 포함된 문자열이 나올 수 있어 ",
          inlineCode("document.querySelector"),
          "가 깨질 수 있습니다.",
        ),
        tip(
          "폼 라이브러리·디자인 시스템이 이미 id를 받는다면, 외부에서 온 id가 없을 때만 useId()를 폴백으로 쓰세요.",
        ),
      ],
    },
  ],
};

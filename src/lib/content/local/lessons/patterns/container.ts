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

export const containerLesson: Lesson = {
  id: "patterns/container",
  slug: "container",
  title: "Container / Presentational",
  description:
    "데이터와 UI를 분리하는 고전적 역할 분담을 현대적으로 재해석합니다. 커스텀 훅이 Container를 대체하는 흐름을 이해합니다.",
  category: "patterns",
  difficulty: "basic",
  readingTime: "8 min",
  relatedTermSlugs: [
    "container-presentational",
    "custom-hook",
    "component",
    "props",
  ],
  sections: [
    {
      id: "classic",
      title: "고전적 분리",
      difficulty: "basic",
      blocks: [
        p(
          term("container-presentational", "Container / Presentational"),
          " 패턴은 데이터·부수 효과·구독을 담당하는 Container와, props만 받아 그리는 Presentational(순수 UI)을 나눕니다. 테스트·스토리북·재사용에 유리했습니다.",
        ),
        code(
          `// Presentational — 데이터 출처를 모름
function UserView({
  name,
  bio,
  onFollow,
}: {
  name: string;
  bio: string;
  onFollow: () => void;
}) {
  return (
    <section>
      <h1>{name}</h1>
      <p>{bio}</p>
      <button onClick={onFollow}>팔로우</button>
    </section>
  );
}

// Container — 데이터 연결
function UserContainer({ id }: { id: string }) {
  const user = useUserQuery(id);
  if (user.loading) return <p>로딩…</p>;
  return (
    <UserView
      name={user.name}
      bio={user.bio}
      onFollow={() => follow(id)}
    />
  );
}`,
          "tsx",
          "역할 분리 예시",
        ),
        tip(
          "Presentational은 스토리북에서 가짜 props로 바로 그릴 수 있습니다. 시각 회귀·디자인 협업에 강점이 있습니다.",
        ),
      ],
    },
    {
      id: "modern",
      title: "현대적 재해석",
      difficulty: "intermediate",
      blocks: [
        p(
          "Hooks 이후에는 Container 컴포넌트 대신 ",
          term("custom-hook", "커스텀 훅"),
          "이 데이터 계층을 맡는 경우가 많습니다. UI 컴포넌트가 훅을 호출하거나, 얇은 페이지 컴포넌트가 훅 결과를 Presentational에 넘깁니다.",
        ),
        code(
          `function useUser(id: string) {
  // fetch, cache, error …
  return { name, bio, follow };
}

function UserPage({ id }: { id: string }) {
  const { name, bio, follow } = useUser(id);
  return <UserView name={name} bio={bio} onFollow={follow} />;
}`,
          "tsx",
          "훅이 Container 역할",
        ),
        info(
          "폴더를 ",
          inlineCode("containers/"),
          " vs ",
          inlineCode("components/"),
          "로 강제 분리하던 관행은 필수가 아닙니다. “데이터 연결”과 “순수 UI”의 경계만 팀 안에서 일관되면 됩니다.",
        ),
      ],
    },
    {
      id: "guidelines",
      title: "언제 나누나",
      difficulty: "basic",
      blocks: [
        ul(
          ["같은 UI를 여러 데이터 소스에 붙일 때 → 분리 이득 큼"],
          ["한 화면에서 한 번만 쓰이고 로직이 짧으면 → 한 파일로도 OK"],
          ["서버 컴포넌트가 데이터를 가져오고 클라이언트 UI만 남기는 구조도 같은 정신"],
        ),
        warn(
          "억지로 props drilling만 늘리는 “순수 UI”는 이득이 없습니다. 분리는 비용이 있으니, 재사용·테스트·가독성 목표가 있을 때 적용하세요.",
        ),
      ],
    },
  ],
};

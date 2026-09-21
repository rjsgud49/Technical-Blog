import Link from "next/link";
import { FieldHomeHero } from "@/components/content/FieldHomeHero";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { WriteCta } from "@/components/writer/WriteCta";
import { DEFAULT_FIELD, fieldPath } from "@/lib/field-path";

export default function HomePage() {
  return (
    <div>
      <FieldHomeHero fieldSlug={DEFAULT_FIELD}>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <div className="flex flex-wrap gap-2">
            <DifficultyBadge level="basic" size="md" />
            <DifficultyBadge level="intermediate" size="md" />
            <DifficultyBadge level="advanced" size="md" />
          </div>
          <WriteCta variant="subtle" label="새 글 쓰기" />
        </div>
      </FieldHomeHero>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          {
            href: fieldPath(DEFAULT_FIELD, "/history"),
            title: "React 역사",
            desc: "탄생 배경과 버전 흐름 — 본문이 바로 펼쳐집니다",
            level: "basic" as const,
          },
          {
            href: fieldPath(DEFAULT_FIELD, "/structure"),
            title: "React 구조",
            desc: "렌더링 · Fiber · 데이터 흐름",
            level: "intermediate" as const,
          },
          {
            href: fieldPath(DEFAULT_FIELD, "/hooks"),
            title: "Hooks",
            desc: "기본 훅부터 커스텀 훅까지",
            level: "basic" as const,
          },
          {
            href: fieldPath(DEFAULT_FIELD, "/patterns"),
            title: "패턴",
            desc: "실무에서 쓰는 구성 패턴",
            level: "intermediate" as const,
          },
          {
            href: fieldPath(DEFAULT_FIELD, "/glossary"),
            title: "단어사전",
            desc: "핵심 용어를 한 페이지에서",
            level: "basic" as const,
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-neutral-800">
                {card.title}
              </h2>
              <DifficultyBadge level={card.level} />
            </div>
            <p className="mt-2 text-sm text-neutral-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

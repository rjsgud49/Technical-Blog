import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import type { Topic } from "@/types/content";

interface TopicListProps {
  topics: Topic[];
  groupLabel?: string;
}

export function TopicList({ topics, groupLabel }: TopicListProps) {
  if (topics.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        아직 등록된 주제가 없습니다.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      {groupLabel && (
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          {groupLabel}
        </h2>
      )}
      <ul className="divide-y divide-neutral-100">
        {topics.map((topic) => (
          <li key={topic.slug} className="py-5 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={topic.href}
                className="text-xl font-semibold text-primary-600 transition-colors duration-150 hover:text-primary-700"
              >
                {topic.title}
              </Link>
              <DifficultyBadge level={topic.difficulty} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              {topic.readingTime && (
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon />
                  {topic.readingTime}
                </span>
              )}
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                {categoryLabel(topic.category)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {topic.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function categoryLabel(category: Topic["category"]) {
  const map: Record<string, string> = {
    history: "역사",
    structure: "구조",
    hooks: "Hooks",
    patterns: "패턴",
  };
  return map[category] ?? category;
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

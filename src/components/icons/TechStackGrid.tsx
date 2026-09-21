import Link from "next/link";
import { TechIcon } from "@/components/icons/TechIcon";
import {
  listTechStack,
  techCategoryLabel,
  type TechStackItem,
} from "@/data/tech-stack";

interface TechStackGridProps {
  /** 특정 카테고리만 보여줄 때 */
  category?: TechStackItem["category"];
  /** id 목록만 보여줄 때 (미지정 시 전체) */
  ids?: string[];
  title?: string;
  description?: string;
}

export function TechStackGrid({
  category,
  ids,
  title = "기술 스택 아이콘",
  description = "id만으로 어디서든 가져다 쓸 수 있습니다. 예: <TechIcon id=\"react\" />",
}: TechStackGridProps) {
  let items = category ? listTechStack(category) : listTechStack();
  if (ids?.length) {
    const set = new Set(ids);
    items = items.filter((item) => set.has(item.id));
  }

  const grouped = items.reduce<Record<string, TechStackItem[]>>((acc, item) => {
    const key = item.category;
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  return (
    <section className="mb-12 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
        <code className="mt-3 block overflow-x-auto rounded-lg bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-100">
          {`import { TechIcon } from "@/components/icons/TechIcon";\n<TechIcon id="react" size="lg" withLabel />`}
        </code>
      </div>

      <div className="space-y-6">
        {(Object.keys(grouped) as TechStackItem["category"][]).map((cat) => (
          <div key={cat}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {techCategoryLabel[cat]}
            </h3>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {grouped[cat].map((item) => {
                const content = (
                  <>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-50 ring-1 ring-neutral-100">
                      <TechIcon id={item.id} size={28} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-neutral-800">
                        {item.name}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-neutral-400">
                        id=&quot;{item.id}&quot;
                      </span>
                    </span>
                  </>
                );

                return (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-neutral-50"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

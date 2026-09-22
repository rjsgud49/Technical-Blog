import type { ManagedCategory } from "@/types/admin";
import type { NavSection } from "@/types/content";
import { sidebarSections } from "@/data/navigation";
import { categoryPublicHref } from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD } from "@/lib/field-path";

export type FieldNavSection = {
  key: string;
  categoryId?: string;
  slug: string;
  label: string;
  href: string;
  seedItems: NonNullable<NavSection["items"]>;
};

/** 분야 목차: DB order 기준. 시드 카테고리는 라벨·시드 글을 유지한다. */
export function buildFieldNavSections(
  field: string,
  categories: ManagedCategory[],
): FieldNavSection[] {
  const seedBySlug = new Map(
    field === DEFAULT_FIELD
      ? sidebarSections.map((s) => [s.id, s] as const)
      : [],
  );

  const fieldCats = [...categories]
    .filter((c) => (c.fieldSlug || DEFAULT_FIELD) === field)
    .sort(
      (a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt),
    );

  const seen = new Set<string>();
  const out: FieldNavSection[] = [];

  for (const cat of fieldCats) {
    seen.add(cat.slug);
    const seed = seedBySlug.get(cat.slug);
    out.push({
      key: cat.id,
      categoryId: cat.id,
      slug: cat.slug,
      label: seed?.label ?? cat.label,
      href: seed?.href ?? categoryPublicHref(cat.slug, field),
      seedItems: seed?.items ? [...seed.items] : [],
    });
  }

  for (const seed of seedBySlug.values()) {
    if (seen.has(seed.id)) continue;
    out.push({
      key: `seed:${seed.id}`,
      slug: seed.id,
      label: seed.label,
      href: seed.href,
      seedItems: seed.items ? [...seed.items] : [],
    });
  }

  return out;
}

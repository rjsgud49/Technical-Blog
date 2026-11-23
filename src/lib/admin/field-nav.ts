import type { ManagedCategory } from "@/types/admin";
import { categoryPublicHref } from "@/lib/admin/post-mapper";
import { DEFAULT_FIELD } from "@/lib/field-path";

export type FieldNavSection = {
  key: string;
  categoryId?: string;
  slug: string;
  label: string;
  href: string;
};

/** 분야 목차: DB 카테고리 order·라벨 기준 */
export function buildFieldNavSections(
  field: string,
  categories: ManagedCategory[],
): FieldNavSection[] {
  return [...categories]
    .filter((c) => (c.fieldSlug || DEFAULT_FIELD) === field)
    .sort(
      (a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt),
    )
    .map((cat) => ({
      key: cat.id,
      categoryId: cat.id,
      slug: cat.slug,
      label: cat.label,
      href: categoryPublicHref(cat.slug, field),
    }));
}

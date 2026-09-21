import type { ManagedPost } from "@/types/admin";
import type { Difficulty } from "@/types/content";
import { postSectionHref } from "@/lib/admin/post-mapper";
import { applySidebarOrder } from "@/lib/admin/sidebar-order";

export type SidebarNavItem = {
  key: string;
  label: string;
  href: string;
  difficulty?: Difficulty;
  postId?: string;
};

/** /hooks/use-ref → use-ref , /history#origin → origin */
function slugFromSeedHref(href: string): string | null {
  const [path, hash] = href.split("#");
  if (hash) return hash;
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  return parts[parts.length - 1] ?? null;
}

/**
 * 시드 목차 + 작성 글 병합.
 * 같은 slug면 시드를 작성 글로 대체(중복 useRef 방지). 나머지 작성 글은 뒤에 추가.
 * 작성 글 링크는 카테고리 페이지 앵커(/c/cat#slug) — React history#section 과 동일.
 */
export function mergeSectionNavItems(
  sectionId: string,
  seedItems: { label: string; href: string; difficulty?: Difficulty }[],
  posts: ManagedPost[],
): SidebarNavItem[] {
  const bySlug = new Map(
    posts
      .filter((p) => p.published && p.categorySlug === sectionId)
      .map((p) => [p.slug, p]),
  );

  const merged: SidebarNavItem[] = seedItems.map((item) => {
    const slug = slugFromSeedHref(item.href);
    const post = slug ? bySlug.get(slug) : undefined;
    if (post) {
      bySlug.delete(slug!);
      return {
        key: `post:${post.id}`,
        label: post.title,
        href: postSectionHref(post),
        difficulty: post.difficulty,
        postId: post.id,
      };
    }
    return {
      key: item.href,
      label: item.label,
      href: item.href,
      difficulty: item.difficulty,
    };
  });

  for (const post of bySlug.values()) {
    merged.push({
      key: `post:${post.id}`,
      label: post.title,
      href: postSectionHref(post),
      difficulty: post.difficulty,
      postId: post.id,
    });
  }

  return applySidebarOrder(sectionId, merged);
}

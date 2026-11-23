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

/**
 * 카테고리 목차 = 공개 글 목록 (호출부에서 order 정렬된 posts를 넘김).
 * 글 링크는 카테고리 페이지 앵커(/hooks#use-ref, /c/cat#slug).
 */
export function mergeSectionNavItems(
  sectionId: string,
  posts: ManagedPost[],
): SidebarNavItem[] {
  const items = posts
    .filter((p) => p.published && p.categorySlug === sectionId)
    .map((post) => ({
      key: `post:${post.id}`,
      label: post.title,
      href: postSectionHref(post),
      difficulty: post.difficulty,
      postId: post.id,
    }));
  return applySidebarOrder(sectionId, items);
}

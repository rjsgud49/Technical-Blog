import type { Difficulty } from "@/types/content";

/** 관리자가 추가·수정하는 카테고리 (DB row 대응) */
export interface ManagedCategory {
  id: string;
  slug: string;
  label: string;
  /** 상단 네비게이션에 표시할 짧은 이름 (있으면 네비에 노출) */
  navLabel?: string;
  description: string;
  /** 소속 학습 분야 (URL /{fieldSlug}/...) */
  fieldSlug: string;
  /** 사이드바·네비 노출 순서 */
  order: number;
  /** 시드(내장) 카테고리는 삭제 제한 가능 */
  builtin?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 관리자가 작성하는 글 (DB row 대응) */
export interface ManagedPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** ManagedCategory.slug */
  categorySlug: string;
  /** 소속 학습 분야 */
  fieldSlug: string;
  difficulty: Difficulty;
  readingTime: string;
  /** 본문 — 줄바꿈 기준 문단. 나중에 MD/블록으로 확장 */
  body: string;
  published: boolean;
  /** 카테고리 내 사이드바·목록 순서 (작을수록 위) */
  order: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface CreateCategoryInput {
  slug: string;
  label: string;
  /** 상단 네비 표시명 (비우면 네비에 안 뜸) */
  navLabel?: string;
  description?: string;
  fieldSlug?: string;
}

export interface UpdateCategoryInput {
  label?: string;
  navLabel?: string;
  description?: string;
  order?: number;
  fieldSlug?: string;
}

export interface CreatePostInput {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  fieldSlug?: string;
  difficulty: Difficulty;
  readingTime?: string;
  body: string;
  published?: boolean;
}

export interface UpdatePostInput {
  slug?: string;
  title?: string;
  description?: string;
  categorySlug?: string;
  fieldSlug?: string;
  difficulty?: Difficulty;
  readingTime?: string;
  body?: string;
  published?: boolean;
  order?: number;
}

export interface ContentAdminRepository {
  listCategories(): Promise<ManagedCategory[]>;
  getCategory(slug: string): Promise<ManagedCategory | null>;
  createCategory(input: CreateCategoryInput): Promise<ManagedCategory>;
  updateCategory(id: string, input: UpdateCategoryInput): Promise<ManagedCategory>;
  deleteCategory(id: string): Promise<void>;

  listPosts(): Promise<ManagedPost[]>;
  getPost(id: string): Promise<ManagedPost | null>;
  getPostBySlug(
    slug: string,
    fieldSlug?: string,
  ): Promise<ManagedPost | null>;
  listPostsByCategory(categorySlug: string): Promise<ManagedPost[]>;
  createPost(input: CreatePostInput, authorId: string): Promise<ManagedPost>;
  updatePost(id: string, input: UpdatePostInput): Promise<ManagedPost>;
  /** 같은 카테고리 글들의 표시 순서를 orderedIds 순으로 저장 */
  reorderPosts(orderedIds: string[]): Promise<void>;
  deletePost(id: string): Promise<void>;
}

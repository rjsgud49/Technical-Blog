import type {
  ContentAdminRepository,
  CreateCategoryInput,
  CreatePostInput,
  ManagedCategory,
  ManagedPost,
  UpdateCategoryInput,
  UpdatePostInput,
} from "@/types/admin";
import { apiContentAdminRepository } from "@/lib/admin/api-content-store";
import { DEFAULT_FIELD } from "@/lib/field-path";
import { normalizeSlug, slugify } from "@/lib/slugify";

const STORAGE_KEY = "rs.admin.content.v1";

interface ContentStoreData {
  categories: ManagedCategory[];
  posts: ManagedPost[];
}

const BUILTIN_SEED: ManagedCategory[] = [
  {
    id: "cat-history",
    slug: "history",
    label: "React 역사",
    description: "탄생부터 현대 React까지",
    fieldSlug: DEFAULT_FIELD,
    order: 0,
    builtin: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-structure",
    slug: "structure",
    label: "React 구조",
    description: "렌더링 · Fiber · 데이터 흐름",
    fieldSlug: DEFAULT_FIELD,
    order: 1,
    builtin: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-hooks",
    slug: "hooks",
    label: "Hooks",
    description: "기본 훅부터 커스텀 훅까지",
    fieldSlug: DEFAULT_FIELD,
    order: 2,
    builtin: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-patterns",
    slug: "patterns",
    label: "패턴",
    description: "실무 구성 패턴",
    fieldSlug: DEFAULT_FIELD,
    order: 3,
    builtin: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-glossary",
    slug: "glossary",
    label: "단어사전",
    description: "React 핵심 용어",
    fieldSlug: DEFAULT_FIELD,
    order: 4,
    builtin: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function now() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function emptyStore(): ContentStoreData {
  return {
    categories: BUILTIN_SEED.map((c) => ({ ...c })),
    posts: [],
  };
}

function readStore(): ContentStoreData {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = emptyStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as ContentStoreData;
    // 내장 카테고리 누락 시 병합
    const slugs = new Set(parsed.categories.map((c) => c.slug));
    for (const builtin of BUILTIN_SEED) {
      if (!slugs.has(builtin.slug)) {
        parsed.categories.push({ ...builtin });
      }
    }
    // fieldSlug 마이그레이션 + 슬러그 NFC 정규화 + 제거된 내장 카테고리(skills) 정리
    for (const cat of parsed.categories) {
      if (!cat.fieldSlug) cat.fieldSlug = DEFAULT_FIELD;
      cat.slug = normalizeSlug(cat.slug);
    }
    parsed.categories = parsed.categories.filter(
      (c) => !(c.builtin && c.slug === "skills"),
    );
    // 구 데이터에 order 없으면 카테고리별로 부여
    const byCat = new Map<string, ManagedPost[]>();
    for (const post of parsed.posts) {
      if (!post.fieldSlug) post.fieldSlug = DEFAULT_FIELD;
      post.slug = normalizeSlug(post.slug);
      post.categorySlug = normalizeSlug(post.categorySlug);
      const list = byCat.get(post.categorySlug) ?? [];
      list.push(post);
      byCat.set(post.categorySlug, list);
    }
    for (const list of byCat.values()) {
      list.forEach((post, i) => {
        if (typeof post.order !== "number") post.order = i;
      });
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStore(data: ContentStoreData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("rs-content-changed"));
}

function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

export const localContentAdminRepository: ContentAdminRepository = {
  async listCategories() {
    return [...readStore().categories].sort((a, b) => a.order - b.order);
  },

  async getCategory(slug) {
    return readStore().categories.find((c) => c.slug === slug) ?? null;
  },

  async createCategory(input: CreateCategoryInput) {
    const store = readStore();
    const slug = slugify(input.slug || input.label);
    const fieldSlug = input.fieldSlug?.trim() || DEFAULT_FIELD;
    if (!slug) throw new Error("슬러그를 입력하세요.");
    if (
      store.categories.some(
        (c) => c.slug === slug && (c.fieldSlug || DEFAULT_FIELD) === fieldSlug,
      )
    ) {
      throw new Error("이미 존재하는 카테고리 슬러그입니다.");
    }
    const category: ManagedCategory = {
      id: uid("cat"),
      slug,
      label: input.label.trim(),
      navLabel: input.navLabel?.trim() || undefined,
      description: input.description?.trim() ?? "",
      fieldSlug,
      order: store.categories.length,
      builtin: false,
      createdAt: now(),
      updatedAt: now(),
    };
    store.categories.push(category);
    writeStore(store);
    return category;
  },

  async updateCategory(id, input: UpdateCategoryInput) {
    const store = readStore();
    const index = store.categories.findIndex((c) => c.id === id);
    if (index < 0) throw new Error("카테고리를 찾을 수 없습니다.");
    const current = store.categories[index];
    store.categories[index] = {
      ...current,
      label: input.label?.trim() ?? current.label,
      navLabel:
        input.navLabel !== undefined
          ? input.navLabel.trim() || undefined
          : current.navLabel,
      description:
        input.description !== undefined
          ? input.description.trim()
          : current.description,
      order: input.order ?? current.order,
      updatedAt: now(),
    };
    writeStore(store);
    return store.categories[index];
  },

  async deleteCategory(id) {
    const store = readStore();
    const category = store.categories.find((c) => c.id === id);
    if (!category) throw new Error("카테고리를 찾을 수 없습니다.");
    if (category.builtin) {
      throw new Error("내장 카테고리는 삭제할 수 없습니다.");
    }
    const hasPosts = store.posts.some((p) => p.categorySlug === category.slug);
    if (hasPosts) {
      throw new Error("이 카테고리에 글이 있어 삭제할 수 없습니다. 글을 먼저 삭제하세요.");
    }
    store.categories = store.categories.filter((c) => c.id !== id);
    writeStore(store);
  },

  async listPosts() {
    return [...readStore().posts].sort((a, b) => {
      if (a.categorySlug !== b.categorySlug) {
        return a.categorySlug.localeCompare(b.categorySlug);
      }
      return a.order - b.order || b.updatedAt.localeCompare(a.updatedAt);
    });
  },

  async getPost(id) {
    return readStore().posts.find((p) => p.id === id) ?? null;
  },

  async getPostBySlug(slug, fieldSlug = DEFAULT_FIELD) {
    const field = fieldSlug || DEFAULT_FIELD;
    return (
      readStore().posts.find(
        (p) =>
          p.slug === slug && (p.fieldSlug || DEFAULT_FIELD) === field,
      ) ?? null
    );
  },

  async listPostsByCategory(categorySlug) {
    return readStore()
      .posts.filter((p) => p.categorySlug === categorySlug)
      .sort((a, b) => a.order - b.order || b.updatedAt.localeCompare(a.updatedAt));
  },

  async createPost(input: CreatePostInput, authorId: string) {
    const store = readStore();
    const slug = slugify(input.slug || input.title);
    const fieldSlug = input.fieldSlug?.trim() || DEFAULT_FIELD;
    if (!slug) throw new Error("슬러그를 입력하세요.");
    if (
      store.posts.some(
        (p) => p.slug === slug && (p.fieldSlug || DEFAULT_FIELD) === fieldSlug,
      )
    ) {
      throw new Error("이미 존재하는 글 슬러그입니다.");
    }
    if (
      !store.categories.some(
        (c) =>
          c.slug === input.categorySlug &&
          (c.fieldSlug || DEFAULT_FIELD) === fieldSlug,
      )
    ) {
      throw new Error("존재하지 않는 카테고리입니다.");
    }
    const siblings = store.posts.filter(
      (p) =>
        p.categorySlug === input.categorySlug &&
        (p.fieldSlug || DEFAULT_FIELD) === fieldSlug,
    );
    const maxOrder = siblings.reduce((m, p) => Math.max(m, p.order ?? 0), -1);
    const post: ManagedPost = {
      id: uid("post"),
      slug,
      title: input.title.trim(),
      description: input.description.trim(),
      categorySlug: input.categorySlug,
      fieldSlug,
      difficulty: input.difficulty,
      readingTime: input.readingTime?.trim() || estimateReadingTime(input.body),
      body: input.body,
      published: input.published ?? true,
      order: maxOrder + 1,
      createdAt: now(),
      updatedAt: now(),
      authorId,
    };
    store.posts.push(post);
    writeStore(store);
    return post;
  },

  async updatePost(id, input: UpdatePostInput) {
    const store = readStore();
    const index = store.posts.findIndex((p) => p.id === id);
    if (index < 0) throw new Error("글을 찾을 수 없습니다.");
    const current = store.posts[index];

    if (input.slug && input.slug !== current.slug) {
      const nextSlug = slugify(input.slug);
      const field =
        input.fieldSlug?.trim() ||
        current.fieldSlug ||
        DEFAULT_FIELD;
      if (
        store.posts.some(
          (p) =>
            p.slug === nextSlug &&
            p.id !== id &&
            (p.fieldSlug || DEFAULT_FIELD) === field,
        )
      ) {
        throw new Error("이미 존재하는 글 슬러그입니다.");
      }
    }
    if (
      input.categorySlug &&
      !store.categories.some(
        (c) =>
          c.slug === input.categorySlug &&
          (c.fieldSlug || DEFAULT_FIELD) ===
            (input.fieldSlug?.trim() ||
              current.fieldSlug ||
              DEFAULT_FIELD),
      )
    ) {
      throw new Error("존재하지 않는 카테고리입니다.");
    }

    const body = input.body ?? current.body;
    store.posts[index] = {
      ...current,
      slug: input.slug ? slugify(input.slug) : current.slug,
      title: input.title?.trim() ?? current.title,
      description: input.description?.trim() ?? current.description,
      categorySlug: input.categorySlug ?? current.categorySlug,
      difficulty: input.difficulty ?? current.difficulty,
      readingTime:
        input.readingTime?.trim() ||
        (input.body ? estimateReadingTime(body) : current.readingTime),
      body,
      published: input.published ?? current.published,
      order: input.order ?? current.order,
      updatedAt: now(),
    };
    writeStore(store);
    return store.posts[index];
  },

  async reorderPosts(orderedIds) {
    const store = readStore();
    const idSet = new Set(orderedIds);
    orderedIds.forEach((id, index) => {
      const post = store.posts.find((p) => p.id === id);
      if (post) {
        post.order = index;
        post.updatedAt = now();
      }
    });
    // 같은 카테고리에 있지만 목록에 없는 글은 뒤로
    for (const post of store.posts) {
      if (idSet.has(post.id)) continue;
      const sibling = store.posts.find((p) => idSet.has(p.id));
      if (sibling && post.categorySlug === sibling.categorySlug) {
        post.order = orderedIds.length + (post.order ?? 0);
      }
    }
    writeStore(store);
  },

  async deletePost(id) {
    const store = readStore();
    if (!store.posts.some((p) => p.id === id)) {
      throw new Error("글을 찾을 수 없습니다.");
    }
    store.posts = store.posts.filter((p) => p.id !== id);
    writeStore(store);
  },
};

export function getContentAdminRepository(): ContentAdminRepository {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "local";
  if (source === "api") return apiContentAdminRepository;
  return localContentAdminRepository;
}

/** 서버 컴포넌트에서는 비어 있음 — 클라이언트 오버레이용 */
export function getManagedPostsSnapshot(): ManagedPost[] {
  if (typeof window === "undefined") return [];
  return readStore().posts.filter((p) => p.published);
}

export function getManagedCategoriesSnapshot(): ManagedCategory[] {
  if (typeof window === "undefined") return BUILTIN_SEED;
  return readStore().categories;
}

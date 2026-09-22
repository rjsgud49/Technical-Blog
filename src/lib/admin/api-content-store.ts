import { apiFetch } from '@/lib/api/client';
import type {
  ContentAdminRepository,
  CreateCategoryInput,
  CreatePostInput,
  ManagedCategory,
  ManagedPost,
  UpdateCategoryInput,
  UpdatePostInput,
} from '@/types/admin';

export const apiContentAdminRepository: ContentAdminRepository = {
  async listCategories() {
    return apiFetch<ManagedCategory[]>('/categories');
  },

  async getCategory(slug) {
    return apiFetch<ManagedCategory | null>(`/categories/${slug}`);
  },

  async createCategory(input: CreateCategoryInput) {
    return apiFetch<ManagedCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateCategory(id, input: UpdateCategoryInput) {
    return apiFetch<ManagedCategory>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteCategory(id) {
    await apiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
  },

  async listPosts() {
    return apiFetch<ManagedPost[]>('/posts');
  },

  async getPost(id) {
    return apiFetch<ManagedPost | null>(`/posts/by-id/${id}`);
  },

  async getPostBySlug(slug, fieldSlug = "react") {
    const field = encodeURIComponent(fieldSlug || "react");
    return apiFetch<ManagedPost | null>(
      `/posts/${encodeURIComponent(slug)}?field=${field}`,
    );
  },

  async listPostsByCategory(categorySlug) {
    return apiFetch<ManagedPost[]>(
      `/posts?category=${encodeURIComponent(categorySlug)}`,
    );
  },

  async createPost(input: CreatePostInput, _authorId: string) {
    void _authorId;
    return apiFetch<ManagedPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updatePost(id, input: UpdatePostInput) {
    return apiFetch<ManagedPost>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async reorderPosts(orderedIds) {
    await Promise.all(
      orderedIds.map((id, order) =>
        apiFetch<ManagedPost>(`/posts/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ order }),
        }),
      ),
    );
  },

  async reorderCategories(orderedIds) {
    await Promise.all(
      orderedIds.map((id, order) =>
        apiFetch<ManagedCategory>(`/categories/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ order }),
        }),
      ),
    );
  },

  async deletePost(id) {
    await apiFetch<void>(`/posts/${id}`, { method: 'DELETE' });
  },
};

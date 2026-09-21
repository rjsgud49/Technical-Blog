"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getContentAdminRepository } from "@/lib/admin/content-store";
import type {
  CreateCategoryInput,
  CreatePostInput,
  ManagedCategory,
  ManagedPost,
  UpdateCategoryInput,
  UpdatePostInput,
} from "@/types/admin";

interface AdminContentContextValue {
  categories: ManagedCategory[];
  posts: ManagedPost[];
  loading: boolean;
  refresh: () => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<ManagedCategory>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<ManagedCategory>;
  deleteCategory: (id: string) => Promise<void>;
  createPost: (input: CreatePostInput, authorId: string) => Promise<ManagedPost>;
  updatePost: (id: string, input: UpdatePostInput) => Promise<ManagedPost>;
  reorderPosts: (orderedIds: string[]) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

const AdminContentContext = createContext<AdminContentContextValue | null>(
  null,
);

export function AdminContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const repo = useMemo(() => getContentAdminRepository(), []);
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [posts, setPosts] = useState<ManagedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [cats, list] = await Promise.all([
      repo.listCategories(),
      repo.listPosts(),
    ]);
    setCategories(cats);
    setPosts(list);
  }, [repo]);

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();

    const onChange = () => {
      void refresh();
    };
    window.addEventListener("rs-content-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("rs-content-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const value = useMemo<AdminContentContextValue>(
    () => ({
      categories,
      posts,
      loading,
      refresh,
      createCategory: async (input) => {
        const created = await repo.createCategory(input);
        await refresh();
        return created;
      },
      updateCategory: async (id, input) => {
        const updated = await repo.updateCategory(id, input);
        await refresh();
        return updated;
      },
      deleteCategory: async (id) => {
        await repo.deleteCategory(id);
        await refresh();
      },
      createPost: async (input, authorId) => {
        const created = await repo.createPost(input, authorId);
        await refresh();
        return created;
      },
      updatePost: async (id, input) => {
        const updated = await repo.updatePost(id, input);
        await refresh();
        return updated;
      },
      reorderPosts: async (orderedIds) => {
        await repo.reorderPosts(orderedIds);
        await refresh();
      },
      deletePost: async (id) => {
        await repo.deletePost(id);
        await refresh();
      },
    }),
    [categories, posts, loading, refresh, repo],
  );

  return (
    <AdminContentContext.Provider value={value}>
      {children}
    </AdminContentContext.Provider>
  );
}

export function useAdminContent() {
  const ctx = useContext(AdminContentContext);
  if (!ctx) {
    throw new Error(
      "useAdminContent는 AdminContentProvider 안에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}

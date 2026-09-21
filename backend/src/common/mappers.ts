import { Category } from '../categories/category.entity';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';
import { StudyService } from '../study-services/study-service.entity';
import { FieldHome } from '../field-homes/field-home.entity';

/** 프론트 ManagedCategory / ManagedPost / AuthUser 와 동일 스키마 */
export function toCategoryDto(category: Category) {
  return {
    id: category.id,
    slug: category.slug,
    label: category.label,
    navLabel: category.navLabel ?? undefined,
    description: category.description,
    fieldSlug: category.fieldSlug || 'react',
    order: category.order,
    builtin: category.builtin,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toPostDto(post: Post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    categorySlug: post.category?.slug ?? '',
    fieldSlug: post.fieldSlug || post.category?.fieldSlug || 'react',
    difficulty: post.difficulty,
    readingTime: post.readingTime,
    body: post.body,
    published: post.published,
    order: post.order ?? 0,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    authorId: post.authorId,
  };
}

export function toUserDto(user: User) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

export function toStudyServiceDto(row: StudyService) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.shortName,
    description: row.description,
    path: row.path,
    href: `/${row.path}`,
    comingSoon: false,
    builtin: row.builtin,
  };
}

export function toFieldHomeDto(row: FieldHome) {
  return {
    fieldSlug: row.fieldSlug,
    title: row.title,
    description: row.description,
    tagline: row.tagline,
    logoDataUrl: row.logoDataUrl ?? null,
  };
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function estimateReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

export function normalizeFieldSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

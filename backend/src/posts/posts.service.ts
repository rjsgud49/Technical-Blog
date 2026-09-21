import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { Category } from '../categories/category.entity';
import { CreatePostDto, UpdatePostDto } from '../common/dto';
import {
  estimateReadingTime,
  normalizeFieldSlug,
  slugify,
  toPostDto,
} from '../common/mappers';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async list(publishedOnly = false, fieldSlug?: string) {
    const where: Record<string, unknown> = {};
    if (publishedOnly) where.published = true;
    if (fieldSlug) where.fieldSlug = normalizeFieldSlug(fieldSlug) || 'react';
    const rows = await this.posts.find({
      where: Object.keys(where).length ? where : undefined,
      order: { order: 'ASC', updatedAt: 'DESC' },
      relations: ['category', 'author'],
    });
    return rows.map(toPostDto);
  }

  async getById(id: string) {
    const row = await this.posts.findOne({
      where: { id },
      relations: ['category', 'author'],
    });
    return row ? toPostDto(row) : null;
  }

  async getBySlug(slug: string, publishedOnly = false, fieldSlug = 'react') {
    const field = normalizeFieldSlug(fieldSlug) || 'react';
    const row = await this.posts.findOne({
      where: publishedOnly
        ? { slug, published: true, fieldSlug: field }
        : { slug, fieldSlug: field },
      relations: ['category', 'author'],
    });
    return row ? toPostDto(row) : null;
  }

  async listByCategory(
    categorySlug: string,
    publishedOnly = false,
    fieldSlug = 'react',
  ) {
    const field = normalizeFieldSlug(fieldSlug) || 'react';
    const category = await this.categories.findOne({
      where: { slug: categorySlug, fieldSlug: field },
    });
    if (!category) return [];
    const rows = await this.posts.find({
      where: publishedOnly
        ? { categoryId: category.id, published: true, fieldSlug: field }
        : { categoryId: category.id, fieldSlug: field },
      order: { order: 'ASC', updatedAt: 'DESC' },
      relations: ['category', 'author'],
    });
    return rows.map(toPostDto);
  }

  async create(dto: CreatePostDto, authorId: string) {
    const slug = slugify(dto.slug || dto.title);
    const fieldSlug = normalizeFieldSlug(dto.fieldSlug || 'react') || 'react';
    if (!slug) throw new BadRequestException('슬러그를 입력하세요.');
    const exists = await this.posts.findOne({ where: { slug, fieldSlug } });
    if (exists) {
      throw new BadRequestException('이미 존재하는 글 슬러그입니다.');
    }
    const category = await this.categories.findOne({
      where: { slug: dto.categorySlug, fieldSlug },
    });
    if (!category) {
      throw new BadRequestException('존재하지 않는 카테고리입니다.');
    }

    const siblingCount = await this.posts.count({
      where: { categoryId: category.id, fieldSlug },
    });

    const row = await this.posts.save(
      this.posts.create({
        slug,
        title: dto.title.trim(),
        description: dto.description.trim(),
        fieldSlug,
        difficulty: dto.difficulty,
        readingTime:
          dto.readingTime?.trim() || estimateReadingTime(dto.body),
        body: dto.body,
        published: dto.published ?? true,
        order: dto.order ?? siblingCount,
        categoryId: category.id,
        authorId,
      }),
    );
    const full = await this.posts.findOne({
      where: { id: row.id },
      relations: ['category', 'author'],
    });
    return toPostDto(full!);
  }

  async update(id: string, dto: UpdatePostDto) {
    const row = await this.posts.findOne({
      where: { id },
      relations: ['category', 'author'],
    });
    if (!row) throw new NotFoundException('글을 찾을 수 없습니다.');

    const fieldSlug =
      dto.fieldSlug !== undefined
        ? normalizeFieldSlug(dto.fieldSlug) || row.fieldSlug
        : row.fieldSlug;

    if (dto.slug && dto.slug !== row.slug) {
      const nextSlug = slugify(dto.slug);
      const clash = await this.posts.findOne({
        where: { slug: nextSlug, fieldSlug },
      });
      if (clash && clash.id !== id) {
        throw new BadRequestException('이미 존재하는 글 슬러그입니다.');
      }
      row.slug = nextSlug;
    }
    if (dto.categorySlug) {
      const category = await this.categories.findOne({
        where: { slug: dto.categorySlug, fieldSlug },
      });
      if (!category) {
        throw new BadRequestException('존재하지 않는 카테고리입니다.');
      }
      row.categoryId = category.id;
    }
    row.fieldSlug = fieldSlug;
    if (dto.title !== undefined) row.title = dto.title.trim();
    if (dto.description !== undefined) row.description = dto.description.trim();
    if (dto.difficulty !== undefined) row.difficulty = dto.difficulty;
    if (dto.body !== undefined) {
      row.body = dto.body;
      row.readingTime =
        dto.readingTime?.trim() || estimateReadingTime(dto.body);
    } else if (dto.readingTime !== undefined) {
      row.readingTime = dto.readingTime.trim();
    }
    if (dto.published !== undefined) row.published = dto.published;
    if (dto.order !== undefined) row.order = dto.order;

    await this.posts.save(row);
    const full = await this.posts.findOne({
      where: { id },
      relations: ['category', 'author'],
    });
    return toPostDto(full!);
  }

  async remove(id: string) {
    const row = await this.posts.findOne({ where: { id } });
    if (!row) throw new NotFoundException('글을 찾을 수 없습니다.');
    await this.posts.remove(row);
  }
}

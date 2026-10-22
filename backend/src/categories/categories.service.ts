import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Post } from '../posts/post.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../common/dto';
import { normalizeFieldSlug, slugify, toCategoryDto } from '../common/mappers';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async list(fieldSlug?: string) {
    const where = fieldSlug
      ? { fieldSlug: normalizeFieldSlug(fieldSlug) || 'react' }
      : undefined;
    const rows = await this.categories.find({
      where,
      order: { order: 'ASC' },
    });
    return rows.map(toCategoryDto);
  }

  async getBySlug(slug: string, fieldSlug = 'react') {
    const field = normalizeFieldSlug(fieldSlug) || 'react';
    const row = await this.categories.findOne({
      where: { slug, fieldSlug: field },
    });
    return row ? toCategoryDto(row) : null;
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.slug || dto.label);
    const fieldSlug = normalizeFieldSlug(dto.fieldSlug || 'react') || 'react';
    if (!slug) throw new BadRequestException('슬러그를 입력하세요.');
    const exists = await this.categories.findOne({
      where: { slug, fieldSlug },
    });
    if (exists) {
      throw new BadRequestException('이미 존재하는 카테고리 슬러그입니다.');
    }
    const count = await this.categories.count({ where: { fieldSlug } });
    const row = await this.categories.save(
      this.categories.create({
        slug,
        label: dto.label.trim(),
        navLabel: dto.navLabel?.trim() || null,
        description: dto.description?.trim() ?? '',
        fieldSlug,
        order: count,
        builtin: false,
      }),
    );
    return toCategoryDto(row);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const row = await this.categories.findOne({ where: { id } });
    if (!row) throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    if (dto.label !== undefined) row.label = dto.label.trim();
    if (dto.navLabel !== undefined) {
      row.navLabel = dto.navLabel.trim() || null;
    }
    if (dto.description !== undefined) row.description = dto.description.trim();
    if (dto.order !== undefined) row.order = dto.order;
    if (dto.fieldSlug !== undefined) {
      row.fieldSlug = normalizeFieldSlug(dto.fieldSlug) || row.fieldSlug;
    }
    return toCategoryDto(await this.categories.save(row));
  }

  async remove(id: string) {
    await this.categories.manager.transaction(async (manager) => {
      const categories = manager.getRepository(Category);
      const posts = manager.getRepository(Post);
      const row = await categories.findOne({ where: { id } });
      if (!row) throw new NotFoundException('카테고리를 찾을 수 없습니다.');
      if (row.builtin) {
        throw new BadRequestException('내장 카테고리는 삭제할 수 없습니다.');
      }

      const postCount = await posts.count({ where: { categoryId: row.id } });
      if (postCount > 0) {
        let fallback = await categories.findOne({
          where: { fieldSlug: row.fieldSlug, slug: 'uncategorized' },
        });
        if (!fallback) {
          const categoryCount = await categories.count({
            where: { fieldSlug: row.fieldSlug },
          });
          fallback = await categories.save(
            categories.create({
              slug: 'uncategorized',
              label: '카테고리없음',
              description: '소속 카테고리가 삭제되었거나 지정되지 않은 글',
              fieldSlug: row.fieldSlug,
              order: categoryCount,
              builtin: true,
            }),
          );
        }
        await posts.update({ categoryId: row.id }, { categoryId: fallback.id });
      }

      await categories.remove(row);
    });
  }
}

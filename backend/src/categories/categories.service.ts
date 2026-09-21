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
    @InjectRepository(Post) private readonly posts: Repository<Post>,
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
    const row = await this.categories.findOne({ where: { id } });
    if (!row) throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    if (row.builtin) {
      throw new BadRequestException('내장 카테고리는 삭제할 수 없습니다.');
    }
    const postCount = await this.posts.count({
      where: { categoryId: row.id },
    });
    if (postCount > 0) {
      throw new BadRequestException(
        '이 카테고리에 글이 있어 삭제할 수 없습니다. 글을 먼저 삭제하세요.',
      );
    }
    await this.categories.remove(row);
  }
}

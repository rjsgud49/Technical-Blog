import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldHome } from './field-home.entity';
import { UpdateFieldHomeDto } from '../common/dto';
import { toFieldHomeDto } from '../common/mappers';

const DEFAULTS: Record<
  string,
  { title: string; description: string; tagline: string }
> = {
  react: {
    title: 'rjsgud study',
    description:
      'React 역사부터 구조·훅·패턴까지 심화 학습. 왼쪽 목차에서 주제를 고르거나, 아래 목록에서 난이도 태그(상 · 중 · 하)를 확인하며 학습 경로를 잡으세요. 본문의 파란 용어를 누르면 단어사전으로 이동합니다.',
    tagline: '상 · 중 · 하로 쌓아 올리는 React',
  },
};

@Injectable()
export class FieldHomesService {
  constructor(
    @InjectRepository(FieldHome)
    private readonly homes: Repository<FieldHome>,
  ) {}

  async get(fieldSlug: string) {
    const row = await this.homes.findOne({ where: { fieldSlug } });
    if (row) return toFieldHomeDto(row);
    const fallback = DEFAULTS[fieldSlug] ?? {
      title: fieldSlug,
      description: '카테고리와 글을 추가해 학습 공간을 채워 보세요.',
      tagline: '카테고리를 추가해 학습 목차를 만드세요',
    };
    return { fieldSlug, logoDataUrl: null, ...fallback };
  }

  async upsert(fieldSlug: string, dto: UpdateFieldHomeDto) {
    const current = await this.get(fieldSlug);
    const next = {
      fieldSlug,
      title: dto.title?.trim() || current.title,
      description:
        dto.description !== undefined
          ? dto.description.trim()
          : current.description,
      tagline:
        dto.tagline !== undefined ? dto.tagline.trim() : current.tagline,
      logoDataUrl:
        dto.logoDataUrl !== undefined
          ? dto.logoDataUrl || null
          : (current.logoDataUrl ?? null),
    };
    if (!next.title) {
      throw new NotFoundException('제목을 입력하세요.');
    }
    await this.homes.save(this.homes.create(next));
    return this.get(fieldSlug);
  }
}

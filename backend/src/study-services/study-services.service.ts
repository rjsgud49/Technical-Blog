import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyService } from './study-service.entity';
import { CreateStudyServiceDto } from '../common/dto';
import { normalizeFieldSlug, toStudyServiceDto } from '../common/mappers';

const RESERVED = new Set([
  'admin',
  'login',
  'api',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);

@Injectable()
export class StudyServicesService {
  constructor(
    @InjectRepository(StudyService)
    private readonly services: Repository<StudyService>,
  ) {}

  async list() {
    const rows = await this.services.find({ order: { createdAt: 'ASC' } });
    const hasReact = rows.some((r) => r.path === 'react');
    const list = rows.map(toStudyServiceDto);
    if (!hasReact) {
      list.unshift({
        id: 'react',
        name: 'rjsgud study',
        shortName: 'RJ',
        description: 'React 역사 · 구조 · 훅 · 패턴',
        path: 'react',
        href: '/react',
        comingSoon: false,
        builtin: true,
      });
    }
    return list;
  }

  async create(dto: CreateStudyServiceDto) {
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('분야 이름을 입력하세요.');
    const path = normalizeFieldSlug(dto.path || name);
    if (!path) throw new BadRequestException('경로를 입력하세요.');
    if (RESERVED.has(path) || path === 'react') {
      throw new BadRequestException(`「${path}」는 사용할 수 없는 경로입니다.`);
    }
    const exists = await this.services.findOne({ where: { path } });
    if (exists) {
      throw new BadRequestException('이미 같은 경로의 분야가 있습니다.');
    }

    const shortName = (dto.shortName?.trim() || name.slice(0, 2).toUpperCase())
      .slice(0, 3);
    const row = await this.services.save(
      this.services.create({
        name,
        shortName: shortName || 'FD',
        description: dto.description?.trim() ?? '',
        path,
        builtin: false,
      }),
    );
    return toStudyServiceDto(row);
  }

  async remove(id: string) {
    if (id === 'react') {
      throw new BadRequestException('내장 분야는 삭제할 수 없습니다.');
    }
    const row = await this.services.findOne({ where: { id } });
    if (!row) throw new NotFoundException('분야를 찾을 수 없습니다.');
    if (row.builtin) {
      throw new BadRequestException('내장 분야는 삭제할 수 없습니다.');
    }
    await this.services.remove(row);
  }
}

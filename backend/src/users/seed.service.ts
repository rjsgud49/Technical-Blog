import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { Category } from '../categories/category.entity';
import { StudyService } from '../study-services/study-service.entity';
import { FieldHome } from '../field-homes/field-home.entity';

const BUILTIN_CATEGORIES = [
  {
    slug: 'history',
    label: 'React 역사',
    description: '탄생부터 현대 React까지',
    fieldSlug: 'react',
    order: 0,
  },
  {
    slug: 'structure',
    label: 'React 구조',
    description: '렌더링 · Fiber · 데이터 흐름',
    fieldSlug: 'react',
    order: 1,
  },
  {
    slug: 'hooks',
    label: 'Hooks',
    description: '기본 훅부터 커스텀 훅까지',
    fieldSlug: 'react',
    order: 2,
  },
  {
    slug: 'patterns',
    label: '패턴',
    description: '실무 구성 패턴',
    fieldSlug: 'react',
    order: 3,
  },
  {
    slug: 'glossary',
    label: '단어사전',
    description: 'React 핵심 용어',
    fieldSlug: 'react',
    order: 4,
  },
];

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(StudyService)
    private readonly services: Repository<StudyService>,
    @InjectRepository(FieldHome)
    private readonly homes: Repository<FieldHome>,
    private readonly config: ConfigService,
  ) {}

  async run() {
    await this.seedCategories();
    await this.removeLegacySkills();
    await this.seedReactService();
    await this.seedReactHome();
    await this.seedAdmin();
  }

  private async seedCategories() {
    for (const item of BUILTIN_CATEGORIES) {
      const exists = await this.categories.findOne({
        where: { slug: item.slug, fieldSlug: item.fieldSlug },
      });
      if (exists) {
        if (!exists.fieldSlug) {
          exists.fieldSlug = item.fieldSlug;
          await this.categories.save(exists);
        }
        continue;
      }
      await this.categories.save(
        this.categories.create({
          ...item,
          builtin: true,
        }),
      );
    }
  }

  /** 프론트에서 제거한 skills 내장 카테고리 정리 */
  private async removeLegacySkills() {
    const skills = await this.categories.findOne({
      where: { slug: 'skills', builtin: true },
    });
    if (!skills) return;
    await this.categories.remove(skills);
  }

  private async seedReactService() {
    const exists = await this.services.findOne({ where: { path: 'react' } });
    if (exists) {
      if (exists.name === 'React Structure' || exists.shortName === 'RS') {
        exists.name = 'rjsgud study';
        exists.shortName = 'RJ';
        await this.services.save(exists);
      }
      return;
    }
    await this.services.save(
      this.services.create({
        name: 'rjsgud study',
        shortName: 'RJ',
        description: 'React 역사 · 구조 · 훅 · 패턴',
        path: 'react',
        builtin: true,
      }),
    );
  }

  private async seedReactHome() {
    const exists = await this.homes.findOne({ where: { fieldSlug: 'react' } });
    if (exists) {
      if (exists.title === 'React Structure') {
        exists.title = 'rjsgud study';
        await this.homes.save(exists);
      }
      return;
    }
    await this.homes.save(
      this.homes.create({
        fieldSlug: 'react',
        title: 'rjsgud study',
        description:
          'React 역사부터 구조·훅·패턴까지 심화 학습. 왼쪽 목차에서 주제를 고르거나, 아래 목록에서 난이도 태그(상 · 중 · 하)를 확인하며 학습 경로를 잡으세요. 본문의 파란 용어를 누르면 단어사전으로 이동합니다.',
        tagline: '상 · 중 · 하로 쌓아 올리는 React',
      }),
    );
  }

  private async seedAdmin() {
    const username = this.config.get<string>('SEED_ADMIN_USERNAME', 'rjsgud');
    const exists = await this.users.findOne({ where: { username } });
    if (exists) return;

    const password = this.config.get<string>(
      'SEED_ADMIN_PASSWORD',
      'rjsgud123',
    );
    const displayName = this.config.get<string>(
      'SEED_ADMIN_DISPLAY_NAME',
      'rjsgud',
    );
    const passwordHash = await bcrypt.hash(password, 10);
    await this.users.save(
      this.users.create({
        username,
        passwordHash,
        displayName,
        role: 'admin',
      }),
    );
  }
}

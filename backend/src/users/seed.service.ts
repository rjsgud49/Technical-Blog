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

const BCRYPT_ROUNDS = 12;

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

  /**
   * 관리자 계정은 환경변수에서만 읽음 — 소스에 비밀번호 기본값 없음.
   * SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD 필수.
   */
  private async seedAdmin() {
    const username = this.config
      .get<string>('SEED_ADMIN_USERNAME')
      ?.trim()
      .toLowerCase();
    const password = this.config.get<string>('SEED_ADMIN_PASSWORD');
    if (!username || !password) {
      throw new Error(
        'SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD must be set in backend/.env (do not commit secrets).',
      );
    }
    if (password.length < 8) {
      throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters.');
    }

    const displayName =
      this.config.get<string>('SEED_ADMIN_DISPLAY_NAME')?.trim() || username;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const byEmail = await this.users.findOne({ where: { username } });
    if (byEmail) {
      byEmail.passwordHash = passwordHash;
      byEmail.displayName = displayName;
      byEmail.role = 'admin';
      await this.users.save(byEmail);
      return;
    }

    // 구 데모 계정(rjsgud) → 이메일 계정으로 이전
    const legacy = await this.users.findOne({ where: { username: 'rjsgud' } });
    if (legacy) {
      legacy.username = username;
      legacy.passwordHash = passwordHash;
      legacy.displayName = displayName;
      legacy.role = 'admin';
      await this.users.save(legacy);
      return;
    }

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

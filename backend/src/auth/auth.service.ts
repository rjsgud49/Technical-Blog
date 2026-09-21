import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../common/dto';
import { toUserDto } from '../common/mappers';
import { requireJwtSecret } from './auth-secrets';

function expiresInToMs(value: string): number {
  const m = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!m) return 1000 * 60 * 60 * 24 * 7;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult =
    unit === 's'
      ? 1000
      : unit === 'm'
        ? 60_000
        : unit === 'h'
          ? 3_600_000
          : 86_400_000;
  return n * mult;
}

type AttemptState = { count: number; lockedUntil: number };

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly attempts = new Map<string, AttemptState>();

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    requireJwtSecret(this.config);
  }

  async login(dto: LoginDto) {
    const username = dto.username.trim().toLowerCase();
    this.assertNotLocked(username);

    const user = await this.users.findByUsername(username);
    const ok =
      !!user && (await bcrypt.compare(dto.password, user.passwordHash));

    if (!ok) {
      this.recordFailure(username);
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    this.clearFailures(username);

    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '7d');
    const expiresInMs = expiresInToMs(expiresIn);
    const token = await this.jwt.signAsync({
      sub: user!.id,
      username: user!.username,
      role: user!.role,
    });

    return {
      user: toUserDto(user!),
      token,
      expiresAt: Date.now() + expiresInMs,
    };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toUserDto(user);
  }

  private assertNotLocked(key: string) {
    const state = this.attempts.get(key);
    if (!state) return;
    if (state.lockedUntil > Date.now()) {
      const mins = Math.ceil((state.lockedUntil - Date.now()) / 60_000);
      throw new HttpException(
        `로그인 시도가 너무 많습니다. ${mins}분 후 다시 시도하세요.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private recordFailure(key: string) {
    const now = Date.now();
    const prev = this.attempts.get(key);
    if (!prev || now - (prev.lockedUntil || 0) > WINDOW_MS) {
      this.attempts.set(key, { count: 1, lockedUntil: 0 });
      return;
    }
    const count = prev.count + 1;
    if (count >= MAX_ATTEMPTS) {
      this.attempts.set(key, {
        count,
        lockedUntil: now + LOCK_MS,
      });
      return;
    }
    this.attempts.set(key, { count, lockedUntil: 0 });
  }

  private clearFailures(key: string) {
    this.attempts.delete(key);
  }
}

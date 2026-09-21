import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../common/dto';
import { toUserDto } from '../common/mappers';

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

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findByUsername(dto.username.trim());
    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '7d');
    const expiresInMs = expiresInToMs(expiresIn);
    const token = await this.jwt.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      user: toUserDto(user),
      token,
      expiresAt: Date.now() + expiresInMs,
    };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return toUserDto(user);
  }
}

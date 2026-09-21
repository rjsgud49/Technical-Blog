import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  /** 로그인 아이디 = 이메일 (서버에서만 검증) */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  label: string;

  @IsOptional()
  @IsString()
  navLabel?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fieldSlug?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;

  @IsOptional()
  @IsString()
  navLabel?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @IsString()
  fieldSlug?: string;
}

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  description: string;

  @IsString()
  categorySlug: string;

  @IsOptional()
  @IsString()
  fieldSlug?: string;

  @IsIn(['basic', 'intermediate', 'advanced'])
  difficulty: 'basic' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsString()
  readingTime?: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  fieldSlug?: string;

  @IsOptional()
  @IsIn(['basic', 'intermediate', 'advanced'])
  difficulty?: 'basic' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsString()
  readingTime?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class CreateStudyServiceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(1)
  path: string;
}

export class UpdateFieldHomeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  /** null이면 기본 로고로 되돌림 */
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  logoDataUrl?: string | null;
}

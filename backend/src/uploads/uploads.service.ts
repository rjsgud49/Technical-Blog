import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, relative, resolve, isAbsolute } from 'path';

const MAX_BYTES = 8 * 1024 * 1024;

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const SAFE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i;

function sniffExt(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return '.jpg';
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return '.png';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return '.gif';
  }
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return '.webp';
  }
  return null;
}

@Injectable()
export class UploadsService {
  private readonly dir: string;

  constructor(config: ConfigService) {
    const fromEnv = config.get<string>('UPLOAD_DIR')?.trim();
    this.dir = fromEnv
      ? fromEnv
      : process.platform === 'win32'
        ? 'C:/app-data/uploads/blog'
        : join(process.cwd(), 'uploads');
    mkdirSync(this.dir, { recursive: true });
  }

  save(file: { buffer: Buffer; size: number; originalname?: string }) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('파일이 비어 있습니다.');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('이미지는 8MB 이하여야 합니다.');
    }
    const ext = sniffExt(file.buffer);
    if (!ext) {
      throw new BadRequestException(
        'JPEG, PNG, GIF, WebP 이미지만 올릴 수 있습니다.',
      );
    }
    const filename = `${randomUUID()}${ext}`;
    writeFileSync(join(this.dir, filename), file.buffer);
    return {
      url: `/api/uploads/${filename}`,
      filename,
      originalFilename: file.originalname ?? filename,
    };
  }

  resolveFile(filename: string) {
    if (!SAFE_NAME.test(filename)) {
      throw new BadRequestException('잘못된 파일명입니다.');
    }
    const absolute = resolve(this.dir, filename);
    const root = resolve(this.dir);
    const rel = relative(root, absolute);
    if (rel.startsWith('..') || isAbsolute(rel) || !existsSync(absolute)) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    return {
      path: absolute,
      mime: MIME_BY_EXT[ext] ?? 'application/octet-stream',
    };
  }
}

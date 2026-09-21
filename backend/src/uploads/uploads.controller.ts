import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MulterExceptionFilter } from './multer-exception.filter';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseFilters(MulterExceptionFilter)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('이미지 파일을 선택해 주세요.');
    }
    return this.uploads.save(file);
  }

  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() res: Response) {
    const file = this.uploads.resolveFile(filename);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.type(file.mime);
    return res.sendFile(file.path);
  }
}

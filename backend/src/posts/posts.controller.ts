import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list(
    @Query('published') published?: string,
    @Query('category') category?: string,
    @Query('field') field?: string,
  ) {
    const publishedOnly = published === 'true';
    if (category) {
      return this.posts.listByCategory(
        category,
        publishedOnly,
        field || 'react',
      );
    }
    return this.posts.list(publishedOnly, field);
  }

  @Get('by-id/:id')
  getById(@Param('id') id: string) {
    return this.posts.getById(id);
  }

  @Get(':slug')
  getBySlug(
    @Param('slug') slug: string,
    @Query('published') published?: string,
    @Query('field') field?: string,
  ) {
    return this.posts.getBySlug(
      slug,
      published === 'true',
      field || 'react',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreatePostDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.posts.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }
}

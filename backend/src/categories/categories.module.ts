import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Post } from '../posts/post.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Post])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService, TypeOrmModule],
})
export class CategoriesModule {}

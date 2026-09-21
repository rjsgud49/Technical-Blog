import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Category } from '../categories/category.entity';
import { StudyService } from '../study-services/study-service.entity';
import { FieldHome } from '../field-homes/field-home.entity';
import { UsersService } from './users.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category, StudyService, FieldHome]),
  ],
  providers: [UsersService, SeedService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}

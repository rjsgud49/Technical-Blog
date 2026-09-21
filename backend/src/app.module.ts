import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';
import { StudyServicesModule } from './study-services/study-services.module';
import { FieldHomesModule } from './field-homes/field-homes.module';
import { User } from './users/user.entity';
import { Category } from './categories/category.entity';
import { Post } from './posts/post.entity';
import { StudyService } from './study-services/study-service.entity';
import { FieldHome } from './field-homes/field-home.entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '3306')),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASSWORD', 'password'),
        database: config.get<string>('DB_NAME', 'react_structure'),
        entities: [User, Category, Post, StudyService, FieldHome],
        synchronize: config.get<string>('DB_SYNC', 'true') === 'true',
        charset: 'utf8mb4',
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    PostsModule,
    StudyServicesModule,
    FieldHomesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

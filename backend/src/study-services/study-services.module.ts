import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyService } from './study-service.entity';
import { Category } from '../categories/category.entity';
import { StudyServicesService } from './study-services.service';
import { StudyServicesController } from './study-services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudyService, Category])],
  providers: [StudyServicesService],
  controllers: [StudyServicesController],
  exports: [StudyServicesService],
})
export class StudyServicesModule {}

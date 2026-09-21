import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StudyServicesService } from './study-services.service';
import { CreateStudyServiceDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class StudyServicesController {
  constructor(private readonly services: StudyServicesService) {}

  @Get()
  list() {
    return this.services.list();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateStudyServiceDto) {
    return this.services.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.services.remove(id);
  }
}

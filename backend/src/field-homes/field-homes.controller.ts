import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { FieldHomesService } from './field-homes.service';
import { UpdateFieldHomeDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('field-homes')
export class FieldHomesController {
  constructor(private readonly homes: FieldHomesService) {}

  @Get(':fieldSlug')
  get(@Param('fieldSlug') fieldSlug: string) {
    return this.homes.get(fieldSlug);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':fieldSlug')
  upsert(
    @Param('fieldSlug') fieldSlug: string,
    @Body() dto: UpdateFieldHomeDto,
  ) {
    return this.homes.upsert(fieldSlug, dto);
  }
}

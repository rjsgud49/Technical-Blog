import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldHome } from './field-home.entity';
import { FieldHomesService } from './field-homes.service';
import { FieldHomesController } from './field-homes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FieldHome])],
  providers: [FieldHomesService],
  controllers: [FieldHomesController],
  exports: [FieldHomesService],
})
export class FieldHomesModule {}

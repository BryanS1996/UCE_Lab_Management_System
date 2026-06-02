import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoriesService } from './laboratories.service';
import { LaboratoriesController } from './laboratories.controller';
import { Laboratory, Reservation } from '../database/entities';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Laboratory, Reservation]),
    CommonModule,
  ],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
  exports: [LaboratoriesService],
})
export class LaboratoriesModule {}

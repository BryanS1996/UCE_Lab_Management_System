import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LaboratoryController } from './laboratory.controller';
import { LaboratoryService } from './laboratory.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [LaboratoryController],
  providers: [LaboratoryService],
  exports: [LaboratoryService],
})
export class LaboratoryModule {}

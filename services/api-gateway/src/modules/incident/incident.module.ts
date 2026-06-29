import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IncidentController } from './incident.controller';

@Module({
  imports: [HttpModule],
  controllers: [IncidentController],
})
export class IncidentModule {}

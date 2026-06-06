import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoriesController } from './laboratories.controller';
import { LaboratoriesService } from './laboratories.service';
import { Laboratory } from './entities/laboratory.entity';
import { Resource } from './entities/resource.entity';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Laboratory, Resource]),
    RabbitmqModule,
    CommonModule,
  ],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
  exports: [LaboratoriesService, TypeOrmModule],
})
export class LaboratoriesModule {}

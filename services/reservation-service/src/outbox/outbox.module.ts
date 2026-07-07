import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outbox } from './outbox.entity';
import { OutboxProcessor } from './outbox.processor';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([Outbox]), RabbitmqModule],
  providers: [OutboxProcessor],
  exports: [TypeOrmModule],
})
export class OutboxModule {}

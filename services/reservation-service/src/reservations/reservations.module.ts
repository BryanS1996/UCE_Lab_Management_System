import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation, Laboratory } from '../database/entities';
import { CommonModule } from '../common/common.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { KafkaModule } from '../kafka/kafka.module';

import { PaymentConsumer } from './payment.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Laboratory]),
    CommonModule,
    RabbitmqModule,
    KafkaModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, PaymentConsumer],
  exports: [ReservationsService],
})
export class ReservationsModule {}

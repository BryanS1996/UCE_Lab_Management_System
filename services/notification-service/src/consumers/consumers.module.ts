import { Module } from '@nestjs/common';
import { ReservationEventsConsumer } from './reservation-events.consumer';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [ReservationEventsConsumer],
})
export class ConsumersModule {}

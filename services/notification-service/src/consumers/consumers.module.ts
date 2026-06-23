import { Module } from '@nestjs/common';
import { ReservationEventsConsumer } from './reservation-events.consumer';
import { LaboratoryEventsConsumer } from './laboratory-events.consumer';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [NotificationsModule, WebsocketModule],
  providers: [ReservationEventsConsumer, LaboratoryEventsConsumer],
})
export class ConsumersModule {}

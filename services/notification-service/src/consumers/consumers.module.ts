import { Module } from '@nestjs/common';
import { ReservationEventsConsumer } from './reservation-events.consumer';
import { MqttCatalogController } from './mqtt-catalog.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [NotificationsModule, WebsocketModule],
  controllers: [MqttCatalogController],
  providers: [ReservationEventsConsumer],
})
export class ConsumersModule {}

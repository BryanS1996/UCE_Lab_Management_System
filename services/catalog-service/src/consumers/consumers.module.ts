import { Module } from '@nestjs/common';
import { LaboratoryEventsConsumer } from './laboratory-events.consumer';
import { CatalogModule } from '../catalog/catalog.module';
import { MqttPublisherModule } from '../mqtt/mqtt-publisher.module';

@Module({
  imports: [CatalogModule, MqttPublisherModule],
  providers: [LaboratoryEventsConsumer],
})
export class ConsumersModule {}

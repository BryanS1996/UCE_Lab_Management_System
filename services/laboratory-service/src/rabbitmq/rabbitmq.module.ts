import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqService } from './rabbitmq.service';
import { IncidentConsumer } from './incident.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from '../resources/entities/resource.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Resource]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'laboratory.events',
            type: 'topic',
            options: { durable: true },
          },
        ],
        uri: configService.get<string>(
          'RABBITMQ_URL',
          'amqp://guest:guest@localhost:5672',
        ),
        connectionInitOptions: { wait: false, timeout: 5000 },
      }),
    }),
  ],
  providers: [RabbitmqService, IncidentConsumer],
  exports: [RabbitMQModule, RabbitmqService],
})
export class RabbitmqModule {}

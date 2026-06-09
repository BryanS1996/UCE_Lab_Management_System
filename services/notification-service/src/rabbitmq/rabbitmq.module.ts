import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          { name: 'reservation.events', type: 'topic', options: { durable: true } },
          { name: 'laboratory.events', type: 'topic', options: { durable: true } },
        ],
        uri: configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672',
        connectionInitOptions: { wait: false, timeout: 5000 },
        enableDirectReplyTo: false,
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitmqModule {}

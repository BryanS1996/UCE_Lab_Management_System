import { Module, Global } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqService } from './rabbitmq.service';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'incident.events',
            type: 'topic',
          },
        ],
        uri: configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672',
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [RabbitmqService],
  exports: [RabbitMQModule, RabbitmqService],
})
export class AppRabbitmqModule {}

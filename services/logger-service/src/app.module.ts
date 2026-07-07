import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerService } from './logger.service';
import { LogsController } from './logs.controller';
import { Log, LogSchema } from './schemas/log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'reservation.events',
            type: 'topic',
          },
        ],
        uri: configService.get<string>(
          'RABBITMQ_URL',
          'amqp://guest:guest@localhost:5672',
        ),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LogsController],
  providers: [LoggerService],
})
export class AppModule {}

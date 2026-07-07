import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IncidentsModule } from './incidents/incidents.module';
import { S3Module } from './s3/s3.module';
import { AppRabbitmqModule } from './rabbitmq/rabbitmq.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/incidents',
      }),
      inject: [ConfigService],
    }),
    IncidentsModule,
    S3Module,
    AppRabbitmqModule,
    HealthModule,
  ],
})
export class AppModule {}

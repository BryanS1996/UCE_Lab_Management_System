import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { ResourcesModule } from './resources/resources.module';
import { CommonModule } from './common/common.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { HealthModule } from './health/health.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    CommonModule,
    RabbitmqModule,
    LaboratoriesModule,
    ResourcesModule,
    HealthModule,
  ],
})
export class AppModule {}

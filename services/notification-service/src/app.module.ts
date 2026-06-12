import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './database/entities';
import { NotificationsModule } from './notifications/notifications.module';
import { ConsumersModule } from './consumers/consumers.module';
import { WebsocketModule } from './websocket/websocket.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de datos PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5437),
        username: configService.get<string>('DB_USERNAME', 'notifuser'),
        password: configService.get<string>('DB_PASSWORD', 'notifpassword'),
        database: configService.get<string>('DB_NAME', 'notification_service'),
        entities: [Notification],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // Módulos de infraestructura
    CommonModule,
    RabbitmqModule,
    WebsocketModule,

    // Módulos de dominio
    NotificationsModule,
    ConsumersModule,
    HealthModule,
  ],
})
export class AppModule {}

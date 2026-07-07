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
import { KafkaModule } from './kafka/kafka.module';
import { MailModule } from './mail/mail.module';

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
        synchronize: true, // No hay migraciones definidas; auto-crear tablas en todos los ambientes
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
    KafkaModule,
    MailModule,

    // Módulos de dominio
    NotificationsModule,
    ConsumersModule,
    HealthModule,
  ],
})
export class AppModule {}

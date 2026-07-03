import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { NotificationModule } from './modules/notification/notification.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { CatalogModule } from './modules/catalog/catalog.module';

import { PaymentModule } from './modules/payment/payment.module';
import { IncidentModule } from './modules/incident/incident.module';
import { UsersModule } from './modules/users/users.module';
import { DocsController } from './docs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    AuthModule,
    LaboratoryModule,
    ReservationModule,
    NotificationModule,
    CatalogModule,
    PaymentModule,
    IncidentModule,
    UsersModule,
  ],
  controllers: [AppController, DocsController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

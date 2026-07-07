import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitmqModule,
    HealthModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class AppModule {}

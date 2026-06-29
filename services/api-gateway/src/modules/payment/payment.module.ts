import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment.controller';

@Module({
  imports: [HttpModule],
  controllers: [PaymentController],
})
export class PaymentModule {}

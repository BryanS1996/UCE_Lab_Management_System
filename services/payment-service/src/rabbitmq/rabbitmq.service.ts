import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export interface PaymentSucceededEvent {
  reservation_id: string;
  status: string;
}

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishPaymentSucceeded(payload: PaymentSucceededEvent) {
    this.logger.log(`Publishing payment.succeeded event for reservation ${payload.reservation_id}`);
    await this.amqpConnection.publish('amq.topic', 'payment.succeeded', payload);
  }
}

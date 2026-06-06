import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishLaboratoryCreated(payload: any) {
    try {
      await this.amqpConnection.publish(
        'laboratory.events',
        'laboratory.created',
        payload,
      );
    } catch (e) {
      console.warn('[RabbitMQ] Could not publish laboratory.created:', e.message);
    }
  }

  async publishLaboratoryUpdated(payload: any) {
    try {
      await this.amqpConnection.publish(
        'laboratory.events',
        'laboratory.updated',
        payload,
      );
    } catch (e) {
      console.warn('[RabbitMQ] Could not publish laboratory.updated:', e.message);
    }
  }
}

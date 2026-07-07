import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as crypto from 'crypto';

@Injectable()
export class RabbitmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishLaboratoryCreated(payload: any) {
    try {
      const correlationId = crypto.randomUUID();
      await this.amqpConnection.publish(
        'laboratory.events',
        'laboratory.created',
        payload,
        {
          appId: 'laboratory-service',
          headers: {
            'x-correlation-id': correlationId,
          },
        },
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.warn(
        '[RabbitMQ] Could not publish laboratory.created:',
        errorMessage,
      );
    }
  }

  async publishLaboratoryUpdated(payload: any) {
    try {
      const correlationId = crypto.randomUUID();
      await this.amqpConnection.publish(
        'laboratory.events',
        'laboratory.updated',
        payload,
        {
          appId: 'laboratory-service',
          headers: {
            'x-correlation-id': correlationId,
          },
        },
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.warn(
        '[RabbitMQ] Could not publish laboratory.updated:',
        errorMessage,
      );
    }
  }
}

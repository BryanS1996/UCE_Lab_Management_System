import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as crypto from 'crypto';

@Injectable()
export class RabbitmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishIncidentReported(payload: any) {
    try {
      const correlationId = crypto.randomUUID();
      await this.amqpConnection.publish(
        'incident.events',
        'incident.reported',
        payload,
        {
          appId: 'incident-service',
          headers: {
            'x-correlation-id': correlationId,
          },
        },
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.warn(
        '[RabbitMQ] Could not publish incident.reported:',
        errorMessage,
      );
    }
  }
}

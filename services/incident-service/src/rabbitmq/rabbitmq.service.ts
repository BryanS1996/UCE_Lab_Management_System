import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishIncidentReported(payload: any) {
    try {
      await this.amqpConnection.publish(
        'incident.events',
        'incident.reported',
        payload,
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

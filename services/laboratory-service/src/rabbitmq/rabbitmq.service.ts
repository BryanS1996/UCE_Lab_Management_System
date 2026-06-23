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
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.warn(
        '[RabbitMQ] Could not publish laboratory.created:',
        errorMessage,
      );
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
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.warn(
        '[RabbitMQ] Could not publish laboratory.updated:',
        errorMessage,
      );
    }
  }

  async publishLaboratoryAlert(payload: any) {
    try {
      await this.amqpConnection.publish(
        'laboratory.events',
        'laboratory.alert',
        payload,
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      console.warn(
        '[RabbitMQ] Could not publish laboratory.alert:',
        errorMessage,
      );
    }
  }
}

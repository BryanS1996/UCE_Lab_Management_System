import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('AuditLogger');

  @RabbitSubscribe({
    exchange: 'reservation.events',
    routingKey: '#',
    queue: 'logger_service_queue',
  })
  public async handleEvent(msg: any, amqpMsg: any) {
    const correlationId = amqpMsg?.properties?.headers?.['x-correlation-id'] || 'No correlation-id';
    this.logger.log(`[CorrelationID: ${correlationId}] Recibido evento: ${JSON.stringify(msg)}`);
  }
}

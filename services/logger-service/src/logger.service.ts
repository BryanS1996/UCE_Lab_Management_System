import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './schemas/log.schema';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('AuditLogger');

  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  @RabbitSubscribe({
    exchange: 'reservation.events',
    routingKey: '#',
    queue: 'logger_service_queue',
  })
  public async handleEvent(msg: any, amqpMsg: any) {
    const correlationId =
      amqpMsg?.properties?.headers?.['x-correlation-id'] || 'No correlation-id';
    this.logger.log(
      `[CorrelationID: ${correlationId}] Recibido evento: ${JSON.stringify(msg)}`,
    );

    try {
      const logEntry = new this.logModel({
        correlationId,
        eventType: msg?.type || amqpMsg?.fields?.routingKey || 'UNKNOWN_EVENT',
        payload: msg,
        source: amqpMsg?.properties?.appId || 'UNKNOWN_SOURCE',
      });
      await logEntry.save();
    } catch (error) {
      this.logger.error('Error al guardar log de auditoría en MongoDB', error);
    }
  }
}

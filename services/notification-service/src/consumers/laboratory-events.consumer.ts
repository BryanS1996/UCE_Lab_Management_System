import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from '../websocket/notifications.gateway';

interface LaboratoryAlertPayload {
  labId: string;
  sensorId: string;
  alertType: string;
  timestamp: string;
  rawPayload: any;
}

@Injectable()
export class LaboratoryEventsConsumer {
  private readonly logger = new Logger(LaboratoryEventsConsumer.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @RabbitSubscribe({
    exchange: 'laboratory.events',
    routingKey: 'laboratory.alert',
    queue: 'notification.laboratory-alert',
    queueOptions: { durable: true },
  })
  async handleLaboratoryAlert(payload: LaboratoryAlertPayload) {
    this.logger.error(
      `[Consumer] ¡Alerta de Laboratorio Crítica Recibida! Tipo: ${payload.alertType} - Lab: ${payload.labId}`,
    );
    
    // Transmitimos la alerta por WebSockets a todos los clientes conectados en tiempo real
    this.notificationsGateway.broadcast('emergency_alert', {
      title: `¡Alerta Crítica: ${payload.alertType}!`,
      message: `Se ha detectado una incidencia grave en el laboratorio ${payload.labId} (Sensor: ${payload.sensorId}).`,
      data: payload,
    });
  }
}

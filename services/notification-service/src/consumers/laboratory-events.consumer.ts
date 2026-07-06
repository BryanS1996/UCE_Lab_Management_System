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

interface LaboratoryCreatedPayload {
  id: number;
  name: string;
  capacity: number;
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
  handleLaboratoryAlert(payload: LaboratoryAlertPayload) {
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

  @RabbitSubscribe({
    exchange: 'laboratory.events',
    routingKey: 'laboratory.created',
    queue: 'notification.laboratory-created',
    queueOptions: { durable: true },
  })
  handleLaboratoryCreated(payload: LaboratoryCreatedPayload) {
    this.logger.log(
      `[Consumer] ✅ Evento recibido: ¡Nuevo laboratorio creado! -> ${payload.name} (Capacidad: ${payload.capacity})`,
    );

    // Transmitimos la notificación por WebSockets para que aparezca en el frontend
    this.notificationsGateway.broadcast('system_notification', {
      title: 'Nuevo Laboratorio',
      message: `El laboratorio "${payload.name}" ha sido creado con éxito.`,
      data: payload,
    });
  }
}

import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsGateway } from '../websocket/notifications.gateway';

interface CatalogUpdatedPayload {
  event: string;
  laboratory_id: number;
  timestamp: string;
}

/**
 * Controlador MQTT que actúa como suscriptor del topic 'system/catalog/updated'.
 * Recibe el evento publicado por el catalog-service vía Mosquitto y lo retransmite
 * a todos los clientes del Frontend conectados a través del WebSocket Gateway.
 */
@Controller()
export class MqttCatalogController {
  private readonly logger = new Logger(MqttCatalogController.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @MessagePattern('system/catalog/updated')
  handleCatalogUpdated(@Payload() data: CatalogUpdatedPayload) {
    this.logger.log(
      `[MQTT] Catálogo actualizado recibido — evento: ${data.event}, lab: ${data.laboratory_id}`,
    );

    // Broadcast a TODOS los clientes WebSocket conectados
    this.notificationsGateway.broadcast('catalog_refreshed', {
      message: 'El catálogo de laboratorios ha sido actualizado.',
      event: data.event,
      laboratory_id: data.laboratory_id,
      timestamp: data.timestamp,
    });

    this.logger.log(
      `[WS] Emitido 'catalog_refreshed' a todos los clientes conectados.`,
    );
  }
}

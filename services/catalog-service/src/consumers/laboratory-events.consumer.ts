import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CatalogService } from '../catalog/catalog.service';
import { CreateCatalogDto } from '../catalog/dto/create-catalog.dto';

interface LaboratoryEventPayload {
  lab_id: number;
  name: string;
  description: string;
  max_capacity: number;
  status: string;
  is_active: boolean;
}

@Injectable()
export class LaboratoryEventsConsumer {
  private readonly logger = new Logger(LaboratoryEventsConsumer.name);

  constructor(
    private readonly catalogService: CatalogService,
    @Inject('MQTT_CLIENT') private readonly mqttClient: ClientProxy,
  ) {}

  @RabbitSubscribe({
    exchange: 'laboratory.events',
    routingKey: 'laboratory.created',
    queue: 'catalog.laboratory-created',
    queueOptions: { durable: true },
  })
  async handleLaboratoryCreated(payload: LaboratoryEventPayload) {
    this.logger.log(`[Consumer] LaboratoryCreated recibido: ${payload.lab_id}`);
    try {
      const dto: CreateCatalogDto = {
        laboratory_id: payload.lab_id,
        name: payload.name,
        description: payload.description,
        capacity: payload.max_capacity,
      };
      await this.catalogService.create(dto);
      this.logger.log(`Laboratorio ${payload.lab_id} añadido automáticamente al catálogo.`);

      // ── MQTT: notificar al sistema que el catálogo cambió ──
      this.mqttClient
        .emit('system/catalog/updated', {
          event: 'laboratory.created',
          laboratory_id: payload.lab_id,
          timestamp: new Date().toISOString(),
        })
        .subscribe({
          error: (err: Error) =>
            this.logger.warn(`[MQTT] No se pudo publicar system/catalog/updated: ${err.message}`),
        });
    } catch (error) {
      this.logger.error(`Error procesando laboratory.created: ${error.message}`);
    }
  }

  @RabbitSubscribe({
    exchange: 'laboratory.events',
    routingKey: 'laboratory.updated',
    queue: 'catalog.laboratory-updated',
    queueOptions: { durable: true },
  })
  async handleLaboratoryUpdated(payload: LaboratoryEventPayload) {
    this.logger.log(`[Consumer] LaboratoryUpdated recibido: ${payload.lab_id}`);
    try {
      await this.catalogService.update(payload.lab_id, {
        name: payload.name,
        description: payload.description,
        capacity: payload.max_capacity,
      });
      this.logger.log(`Catálogo actualizado para el lab ${payload.lab_id}.`);

      // ── MQTT: notificar al sistema que el catálogo cambió ──
      this.mqttClient
        .emit('system/catalog/updated', {
          event: 'laboratory.updated',
          laboratory_id: payload.lab_id,
          timestamp: new Date().toISOString(),
        })
        .subscribe({
          error: (err: Error) =>
            this.logger.warn(`[MQTT] No se pudo publicar system/catalog/updated: ${err.message}`),
        });
    } catch (error) {
      this.logger.error(`Error procesando laboratory.updated: ${error.message}`);
    }
  }
}

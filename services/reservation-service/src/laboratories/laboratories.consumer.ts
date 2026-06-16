import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';

interface LaboratoryEventPayload {
  lab_id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  max_capacity?: number;
  location?: string;
  description?: string;
}

@Injectable()
export class LaboratoriesConsumer {
  private readonly logger = new Logger(LaboratoriesConsumer.name);

  constructor(private readonly labsService: LaboratoriesService) {}

  @RabbitSubscribe({
    exchange: 'laboratory.events',
    routingKey: 'laboratory.created',
    queue: 'reservation.laboratory-created',
    queueOptions: { durable: true },
  })
  async handleLaboratoryCreated(payload: LaboratoryEventPayload) {
    this.logger.log(`📥 [Consumer] Recibido laboratory.created para ID ${payload.lab_id}`);
    try {
      // Intentar ver si ya existe para evitar duplicados
      try {
        const existing = await this.labsService.findOne(payload.lab_id);
        if (existing) {
          this.logger.warn(`El laboratorio con ID ${payload.lab_id} ya existe. Actualizando en su lugar.`);
          await this.labsService.update(payload.lab_id, {
            name: payload.name,
            max_capacity: payload.max_capacity ?? 30,
            is_active: payload.status !== 'INACTIVE',
            location: payload.location,
            description: payload.description,
          });
          return;
        }
      } catch (e) {
        // Si no se encuentra, procedemos a crearlo
      }

      await this.labsService.create({
        lab_id: payload.lab_id,
        name: payload.name,
        max_capacity: payload.max_capacity ?? 30,
        is_active: payload.status !== 'INACTIVE',
        location: payload.location,
        description: payload.description,
      } as any);
      this.logger.log(`✅ Laboratorio creado en DB local: ${payload.name} (ID: ${payload.lab_id})`);
    } catch (error) {
      this.logger.error(`❌ Error guardando laboratorio creado: ${(error as Error).message}`);
    }
  }

  @RabbitSubscribe({
    exchange: 'laboratory.events',
    routingKey: 'laboratory.updated',
    queue: 'reservation.laboratory-updated',
    queueOptions: { durable: true },
  })
  async handleLaboratoryUpdated(payload: LaboratoryEventPayload) {
    this.logger.log(`📥 [Consumer] Recibido laboratory.updated para ID ${payload.lab_id}`);
    try {
      await this.labsService.update(payload.lab_id, {
        name: payload.name,
        max_capacity: payload.max_capacity,
        is_active: payload.status !== 'INACTIVE',
        location: payload.location,
        description: payload.description,
      });
      this.logger.log(`✅ Laboratorio actualizado en DB local: ${payload.name} (ID: ${payload.lab_id})`);
    } catch (error) {
      // Si el laboratorio no existía localmente, lo creamos
      if (error instanceof NotFoundException || (error as Error).message.includes('no encontrado')) {
        this.logger.warn(`Laboratorio ID ${payload.lab_id} no existía. Creando...`);
        try {
          await this.labsService.create({
            lab_id: payload.lab_id,
            name: payload.name,
            max_capacity: payload.max_capacity ?? 30,
            is_active: payload.status !== 'INACTIVE',
            location: payload.location,
            description: payload.description,
          } as any);
        } catch (createError) {
          this.logger.error(`❌ Error creando laboratorio tras fallo de actualización: ${(createError as Error).message}`);
        }
      } else {
        this.logger.error(`❌ Error actualizando laboratorio: ${(error as Error).message}`);
      }
    }
  }
}

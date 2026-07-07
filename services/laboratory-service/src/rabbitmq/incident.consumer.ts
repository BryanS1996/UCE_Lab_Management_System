import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../laboratories/entities/resource.entity';

@Injectable()
export class IncidentConsumer {
  private readonly logger = new Logger(IncidentConsumer.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  @RabbitSubscribe({
    exchange: 'incident.events',
    routingKey: 'incident.reported',
    queue: 'laboratory_service_incident_queue',
  })
  public async handleIncidentReported(payload: any) {
    this.logger.log(
      `Received incident.reported for resource: ${payload.resource_id}`,
    );

    if (!payload.resource_id) {
      return;
    }

    try {
      const resource = await this.resourceRepository.findOne({
        where: { resource_id: payload.resource_id },
      });

      if (resource && resource.is_available) {
        resource.is_available = false; // "En Mantenimiento"
        await this.resourceRepository.save(resource);
        this.logger.log(
          `Resource ${resource.resource_id} marked as unavailable due to incident ${payload.incident_id}`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling incident.reported event', error);
    }
  }
}

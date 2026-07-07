import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outbox, OutboxStatus } from './outbox.entity';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutbox() {
    const pendingEvents = await this.outboxRepository.find({
      where: { status: OutboxStatus.PENDING },
      take: 50,
      order: { createdAt: 'ASC' },
    });

    if (pendingEvents.length === 0) return;
    this.logger.debug(`Processing ${pendingEvents.length} outbox events`);

    for (const event of pendingEvents) {
      try {
        if (event.eventType === 'ReservationCreated') {
          await this.rabbitmqService.publishReservationCreated(event.payload);
        }
        
        event.status = OutboxStatus.PROCESSED;
        await this.outboxRepository.save(event);
        this.logger.debug(`Successfully processed outbox event ${event.id}`);
      } catch (error) {
        this.logger.error(`Failed to process outbox event ${event.id}`, error);
        // We can implement retry logic by leaving it PENDING or changing to FAILED if retries exceeded
      }
    }
  }
}

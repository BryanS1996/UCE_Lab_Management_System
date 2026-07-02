import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export interface ReservationCreatedEvent {
  event: 'ReservationCreated';
  reservation_id: string;
  user_id: string;
  lab_id: number;
  start_time: Date;
  end_time: Date;
  purpose?: string;
  timestamp: string;
}

export interface ReservationConfirmedEvent {
  event: 'ReservationConfirmed';
  reservation_id: string;
  user_id: string;
  lab_id: number;
  start_time: Date;
  end_time: Date;
  paid?: boolean;
  timestamp: string;
}

export interface ReservationCancelledEvent {
  event: 'ReservationCancelled';
  reservation_id: string;
  user_id: string;
  lab_id: number;
  reason?: string;
  timestamp: string;
}

export type ReservationEvent =
  | ReservationCreatedEvent
  | ReservationConfirmedEvent
  | ReservationCancelledEvent;

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);
  private readonly EXCHANGE = 'reservation.events';

  constructor(private readonly amqpConnection: AmqpConnection) {}

  /**
   * Publicar evento de reserva creada
   */
  async publishReservationCreated(
    payload: Omit<ReservationCreatedEvent, 'event' | 'timestamp'>,
  ): Promise<void> {
    const event: ReservationCreatedEvent = {
      ...payload,
      event: 'ReservationCreated',
      timestamp: new Date().toISOString(),
    };
    await this.publish('reservation.created', event);
  }

  /**
   * Publicar evento de reserva confirmada
   */
  async publishReservationConfirmed(
    payload: Omit<ReservationConfirmedEvent, 'event' | 'timestamp'>,
  ): Promise<void> {
    const event: ReservationConfirmedEvent = {
      ...payload,
      event: 'ReservationConfirmed',
      timestamp: new Date().toISOString(),
    };
    await this.publish('reservation.confirmed', event);
  }

  /**
   * Publicar evento de reserva cancelada
   */
  async publishReservationCancelled(
    payload: Omit<ReservationCancelledEvent, 'event' | 'timestamp'>,
  ): Promise<void> {
    const event: ReservationCancelledEvent = {
      ...payload,
      event: 'ReservationCancelled',
      timestamp: new Date().toISOString(),
    };
    await this.publish('reservation.cancelled', event);
  }

  /**
   * Método interno para publicar en el exchange
   */
  private async publish(routingKey: string, payload: ReservationEvent): Promise<void> {
    try {
      await this.amqpConnection.publish(this.EXCHANGE, routingKey, payload);
      this.logger.log(
        `✉️  Evento publicado [${routingKey}]: ${JSON.stringify(payload)}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error publicando evento [${routingKey}]: ${(error as Error).message}`,
      );
      // No lanzamos excepción para no bloquear el flujo principal
      // El error se loguea para monitoreo
    }
  }
}

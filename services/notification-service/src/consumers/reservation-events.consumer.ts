import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

interface ReservationEventPayload {
  reservationId: string;
  userId: string;
  labName: string;
  startTime: Date;
}

@Injectable()
export class ReservationEventsConsumer {
  private readonly logger = new Logger(ReservationEventsConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @RabbitSubscribe({
    exchange: 'reservation.events',
    routingKey: 'reservation.created',
    queue: 'notification.reservation-created',
    queueOptions: { durable: true },
  })
  async handleReservationCreated(payload: ReservationEventPayload) {
    this.logger.log(`[Consumer] ReservationCreated: ${payload.reservationId}`);
    await this.notificationsService.create({
      user_id: payload.userId,
      title: 'Reserva Creada',
      message: `Tu reserva para el ${payload.labName} el ${new Date(payload.startTime).toLocaleDateString('es-EC')} fue registrada exitosamente. Estado: PENDIENTE de confirmación.`,
      type: NotificationType.RESERVATION_CREATED,
      metadata: payload,
    });
  }

  @RabbitSubscribe({
    exchange: 'reservation.events',
    routingKey: 'reservation.confirmed',
    queue: 'notification.reservation-confirmed',
    queueOptions: { durable: true },
  })
  async handleReservationConfirmed(payload: ReservationEventPayload) {
    this.logger.log(
      `[Consumer] ReservationConfirmed: ${payload.reservationId}`,
    );
    await this.notificationsService.create({
      user_id: payload.userId,
      title: 'Reserva Confirmada ✅',
      message: `Tu reserva para el ${payload.labName} el ${new Date(payload.startTime).toLocaleDateString('es-EC')} ha sido CONFIRMADA.`,
      type: NotificationType.RESERVATION_CONFIRMED,
      metadata: payload,
    });
  }

  @RabbitSubscribe({
    exchange: 'reservation.events',
    routingKey: 'reservation.cancelled',
    queue: 'notification.reservation-cancelled',
    queueOptions: { durable: true },
  })
  async handleReservationCancelled(payload: ReservationEventPayload) {
    this.logger.log(
      `[Consumer] ReservationCancelled: ${payload.reservationId}`,
    );
    await this.notificationsService.create({
      user_id: payload.userId,
      title: 'Reserva Cancelada',
      message: `Tu reserva (ID: ${payload.reservationId}) ha sido cancelada.`,
      type: NotificationType.RESERVATION_CANCELLED,
      metadata: payload,
    });
  }
}

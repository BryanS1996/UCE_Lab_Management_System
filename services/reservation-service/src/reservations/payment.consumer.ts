import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ReservationsService } from './reservations.service';


interface PaymentSucceededPayload {
  reservation_id: string;
  status: string;
}

@Injectable()
export class PaymentConsumer {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(private readonly reservationsService: ReservationsService) {}

  @RabbitSubscribe({
    exchange: 'amq.topic', // Or custom exchange if used. Let's use default direct/topic or just queue
    routingKey: 'payment.succeeded',
    queue: 'reservation.payment-succeeded',
    queueOptions: { durable: true },
  })
  async handlePaymentSucceeded(payload: PaymentSucceededPayload) {
    this.logger.log(`📥 [Consumer] Recibido payment.succeeded para reserva ${payload.reservation_id}`);
    
    try {
      // In a real app we might pass a system user, but we'll bypass role check by doing a direct DB update or adding an internal method
      await this.reservationsService.confirmInternal(payload.reservation_id);
      this.logger.log(`✅ Reserva ${payload.reservation_id} confirmada automáticamente tras pago`);
    } catch (error) {
      this.logger.error(`❌ Error al confirmar reserva tras pago: ${(error as Error).message}`);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly rabbitmqService: RabbitmqService,
  ) {
    const stripeKey =
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-01-27.acacia' as any, // Using latest valid or ignoring type for now if mismatch
    });
    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || 'whsec_dummy';
  }

  constructEventFromPayload(signature: string, payload: Buffer): Stripe.Event {
    // In production, payload must be a Buffer.
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
  }

  async handlePaymentSucceeded(reservationId: string) {
    this.logger.log(`Payment succeeded for reservation: ${reservationId}`);

    // Publicar evento en RabbitMQ para que reservation-service y notification-service lo consuman
    await this.rabbitmqService.publishPaymentSucceeded({
      reservation_id: reservationId,
      status: 'PAID',
    });
  }

  async createCheckoutSession(reservationId: string, labName: string) {
    // URL base del frontend para redireccionar tras el pago
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Reserva - ${labName}`,
              description: `Pago por reserva de laboratorio Premium`,
            },
            unit_amount: 1000, // $10.00 en centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/mis-reservas?payment_success=true&reservation_id=${reservationId}`,
      cancel_url: `${frontendUrl}/mis-reservas?payment_cancelled=true`,
      metadata: {
        reservation_id: reservationId,
      },
    });

    return { url: session.url };
  }
}

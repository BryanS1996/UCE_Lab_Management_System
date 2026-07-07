import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
  Logger,
  Body,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request, Response } from 'express';

@Controller('api/payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout-session')
  async createCheckoutSession(
    @Body() body: { reservation_id: string; lab_name: string },
  ) {
    if (!body.reservation_id || !body.lab_name) {
      return { url: null, error: 'Faltan parámetros requeridos.' };
    }
    return this.paymentService.createCheckoutSession(
      body.reservation_id,
      body.lab_name,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = this.paymentService.constructEventFromPayload(
        signature,
        req.body,
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const reservationId = session.metadata?.reservation_id;

        if (reservationId) {
          await this.paymentService.handlePaymentSucceeded(reservationId);
        } else {
          this.logger.warn(
            'Checkout session completed but no reservation_id found in metadata',
          );
        }
      }

      return res.status(HttpStatus.OK).send();
    } catch (err) {
      this.logger.error(`Webhook Error: ${(err as Error).message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(`Webhook Error: ${(err as Error).message}`);
    }
  }
}

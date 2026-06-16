import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER', '');
    const pass = this.configService.get<string>('SMTP_PASS', '');

    this.logger.log(`Configurando Nodemailer con SMTP_USER: ${user} y HOST: ${host}`);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true para 465, false para otros puertos (como 587 que usa TLS)
      auth: {
        user,
        pass,
      },
    });
  }

  async sendConfirmationEmail(payload: {
    email: string;
    userName: string;
    labName: string;
    startTime: string;
    endTime: string;
    purpose: string;
    status?: string;
  }) {
    const isConfirmed = payload.status === 'CONFIRMED';
    const dateFormatted = new Date(payload.startTime).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const startHour = new Date(payload.startTime).toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
    const endHour = new Date(payload.endTime).toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });

    const subjectText = isConfirmed
      ? `[Confirmada] Reserva de Laboratorio: ${payload.labName}`
      : `[Pendiente] Solicitud de Reserva: ${payload.labName}`;

    const descriptionHtml = isConfirmed
      ? `Tu solicitud de reserva de laboratorio ha sido **Aprobada y Confirmada** por el administrador. A continuación, se detallan los datos de tu reserva:`
      : `Tu solicitud de reserva de laboratorio ha sido registrada exitosamente en el sistema de laboratorios. A continuación, se detallan los datos de tu reserva:`;

    const badgeStyle = isConfirmed
      ? `background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; border: 1px solid #a7f3d0;`
      : `background-color: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; border: 1px solid #fde68a;`;

    const badgeText = isConfirmed ? 'CONFIRMADA ✅' : 'PENDIENTE DE APROBACIÓN';

    const footnoteHtml = isConfirmed
      ? `Tu reserva está lista y confirmada. Puedes presentarte al laboratorio en la fecha y hora indicadas.`
      : `Tu reserva requiere la revisión del administrador. Recibirás otra notificación por correo electrónico una vez que tu reserva sea **Confirmada** o **Rechazada**.`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #334155;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h2 style="color: #1e3a8a; margin: 0; font-weight: 800; font-size: 22px;">UCE Lab Management</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px; font-weight: 500;">Confirmación de Solicitud de Reserva</p>
        </div>
        
        <div style="padding: 25px 0;">
          <p style="font-size: 16px; font-weight: bold; color: #0f172a;">Estimado/a ${payload.userName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            ${descriptionHtml}
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 35%;">Laboratorio:</td>
                <td style="padding: 8px 0; color: #1e3a8a; font-weight: bold;">${payload.labName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Fecha:</td>
                <td style="padding: 8px 0; color: #0f172a;">${dateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Horario:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${startHour} - ${endHour}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Motivo:</td>
                <td style="padding: 8px 0; color: #0f172a; font-style: italic;">"${payload.purpose}"</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Estado:</td>
                <td style="padding: 8px 0;">
                  <span style="${badgeStyle}">
                    ${badgeText}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
            ${footnoteHtml}
          </p>
          
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
            Este mensaje es automático y se genera desde el sistema UCE Lab Management System. Por favor no respondas a este correo.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 11px; color: #94a3b8; padding-top: 10px;">
          © 2026 Universidad Central del Ecuador. Todos los derechos reservados.
        </div>
      </div>
    `;

    try {
      this.logger.log(`Enviando correo Gmail a: ${payload.email}`);
      const mailOptions = {
        from: `"UCE Lab Management" <${this.configService.get<string>('SMTP_USER', '')}>`,
        to: payload.email,
        subject: subjectText,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✉️ Correo de confirmación enviado exitosamente a ${payload.email} con estado ${payload.status || 'PENDING'}`);
    } catch (error) {
      this.logger.error(`❌ Falló el envío de correo a ${payload.email}: ${(error as Error).message}`);
    }
  }
}

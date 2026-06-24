import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

interface ReservationEmailPayload {
  email: string;
  userName: string;
  labName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status?: string;
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    const brokersEnv = this.configService.get<string>(
      'KAFKA_BROKERS',
      'localhost:9092',
    );
    this.logger.log(
      `Inicializando consumidor Kafka con brokers: ${brokersEnv}`,
    );
    this.kafka = new Kafka({
      clientId: 'notification-service',
      brokers: brokersEnv.split(','),
    });
    this.consumer = this.kafka.consumer({
      groupId: 'notification-email-group',
    });
  }

  async onModuleInit() {
    this.consumer.connect()
      .then(async () => {
        await this.consumer.subscribe({
          topic: 'reservation-emails',
          fromBeginning: false,
        });
        this.logger.log('🚀 Conectado exitosamente a Apache Kafka como Consumidor');

        // Iniciar el loop de escucha asíncrono
        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            const value = message.value?.toString();
            this.logger.log(`📥 Mensaje recibido en topic '${topic}' partition [${partition}]`);
            if (value) {
              try {
                const payload = JSON.parse(value) as ReservationEmailPayload;
                this.logger.log(`Procesando confirmación de correo para: ${payload.email}`);
                await this.mailService.sendConfirmationEmail(payload);
              } catch (parseError) {
                this.logger.error(`Error parsing Kafka message: ${(parseError as Error).message}`);
              }
            }
          },
        });
      })
      .catch((error) => {
        this.logger.error(`❌ Falló la conexión/suscripción a Kafka: ${(error as Error).message}`);
      });
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.logger.log('Disconnected Kafka Consumer');
    } catch (error) {
      this.logger.error(
        `Error disconnecting Kafka Consumer: ${(error as Error).message}`,
      );
    }
  }
}

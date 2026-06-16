import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const brokersEnv = this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092');
    this.logger.log(`Inicializando productor Kafka con brokers: ${brokersEnv}`);
    this.kafka = new Kafka({
      clientId: 'reservation-service',
      brokers: brokersEnv.split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('🚀 Conectado exitosamente a Apache Kafka como Productor');
    } catch (error) {
      this.logger.error(`❌ Falló la conexión a Kafka: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Disconnected Kafka Producer');
    } catch (error) {
      this.logger.error(`Error disconnecting Kafka Producer: ${(error as Error).message}`);
    }
  }

  async sendEmailNotification(payload: {
    email: string;
    userName: string;
    labName: string;
    startTime: string;
    endTime: string;
    purpose: string;
    status?: string;
  }) {
    try {
      this.logger.log(`Enviando evento de correo a Kafka para: ${payload.email}`);
      await this.producer.send({
        topic: 'reservation-emails',
        messages: [
          {
            key: payload.email,
            value: JSON.stringify(payload),
          },
        ],
      });
      this.logger.log(`✉️ Mensaje enviado a topic 'reservation-emails' para ${payload.email}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando mensaje a Kafka: ${(error as Error).message}`);
    }
  }
}

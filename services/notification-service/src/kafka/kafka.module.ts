import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [KafkaConsumerService],
  exports: [KafkaConsumerService],
})
export class KafkaModule {}

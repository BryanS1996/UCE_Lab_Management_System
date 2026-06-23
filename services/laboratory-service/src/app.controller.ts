import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('lab/+/sensor/+/smoke')
  async handleSmokeAlert(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    this.logger.warn(`¡Alerta MQTT Recibida! Tópico: ${topic}`);
    
    const parts = topic.split('/');
    const labId = parts[1];
    const sensorId = parts[3];

    const alertEvent = {
      labId,
      sensorId,
      alertType: 'SMOKE_DETECTED',
      timestamp: new Date().toISOString(),
      rawPayload: data,
    };

    await this.rabbitmqService.publishLaboratoryAlert(alertEvent);
  }
}

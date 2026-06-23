import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  ],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Configuración Híbrida para MQTT
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_URL || 'mqtt://localhost:1883',
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*', credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Laboratory Service — UCE Lab Management')
    .setDescription(
      'Microservicio de gestión de laboratorios con trazabilidad por usuario',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('laboratories', 'Gestión de laboratorios')
    .addTag('resources', 'Recursos por laboratorio')
    .addTag('health', 'Estado del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Iniciar MQTT antes del servidor HTTP
  await app.startAllMicroservices();

  const port = process.env.PORT || 3002;
  await app.listen(port);
  logger.log(`Laboratory Service running on port ${port}`, 'Bootstrap');
  logger.log(`Swagger: http://localhost:${port}/api/docs`, 'Bootstrap');
  logger.log(`MQTT Microservice connected`, 'Bootstrap');
}

void bootstrap();

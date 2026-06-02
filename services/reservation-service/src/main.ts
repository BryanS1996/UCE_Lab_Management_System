import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS habilitado
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // ─── Swagger / OpenAPI ───────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Reservation Service — UCE Lab Management')
    .setDescription(
      `**Microservicio de Reservas** del Sistema de Gestión de Laboratorios UCE.

Responsabilidades:
- Gestión de laboratorios (CRUD + disponibilidad)
- Creación y gestión de reservas de laboratorio
- Verificación de conflictos de horario
- Publicación de eventos de dominio via RabbitMQ (EDA)
- Control de acceso basado en roles (RBAC)

**Eventos RabbitMQ publicados:**
- \`reservation.created\` → ReservationCreated
- \`reservation.confirmed\` → ReservationConfirmed  
- \`reservation.cancelled\` → ReservationCancelled

**Ambiente:** ${process.env.NODE_ENV || 'development'}`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('laboratories', 'Gestión de laboratorios y disponibilidad')
    .addTag('reservations', 'Gestión de reservas de laboratorio')
    .addTag('health', 'Health check del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Reservation Service API Docs',
  });
  // ────────────────────────────────────────────────────

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Reservation Service running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();

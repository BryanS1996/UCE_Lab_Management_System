import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS habilitado para API Gateway y frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // ─── Swagger / OpenAPI ───────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Auth Service — UCE Lab Management')
    .setDescription(
      `**Microservicio de Autenticación** del Sistema de Gestión de Laboratorios UCE.

Responsabilidades:
- Registro y login de usuarios
- Emisión de JWT (access token 15min + refresh token 7d)
- Gestión de roles (STUDENT, PROFESSOR, ADMIN)
- Cambio de contraseña

**Ambiente:** ${process.env.NODE_ENV || 'development'}`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('auth', 'Registro, Login y gestión de sesión')
    .addTag('users', 'Gestión de usuarios')
    .addTag('health', 'Estado del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Auth Service API Docs',
  });
  // ────────────────────────────────────────────────────

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Auth Service running on port ${port}`, 'Bootstrap');
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}

void bootstrap();

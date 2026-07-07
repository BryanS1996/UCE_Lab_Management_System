import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AxiosExceptionFilter } from './filters/axios-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AxiosExceptionFilter());

  // ─── Centralized Swagger ───────────────────────────────
  // We configure Swagger UI to fetch JSON from the downstream microservices.
  // In QA, they are internally accessible at http://<service-name>:301X/api/docs-json
  // But wait, the browser needs to fetch them. If the browser tries to fetch
  // http://auth-service-qa:3010/api/docs-json, it will fail because it's not exposed!
  // Therefore, Swagger UI must fetch through the API gateway.
  // Since we don't have proxy routes for the swagger JSONs, we can just use the proxy!

  const options = new DocumentBuilder()
    .setTitle('UCE Lab Management System - API Gateway')
    .setDescription('Centralized API Documentation')
    .setVersion('1.0')
    .build();

  // Create empty document just to host the UI
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      urls: [
        // To make this work correctly, the API Gateway would need proxy routes like `/api/auth/docs-json`
        // But for now we can just show the shell, and the user can import JSON manually, or we can define them
        { name: 'Auth Service', url: '/api/auth/docs-json' },
        { name: 'Reservation Service', url: '/api/reservations/docs-json' },
        { name: 'Laboratory Service', url: '/api/laboratories/docs-json' },
        { name: 'Notification Service', url: '/api/notifications/docs-json' },
      ],
    },
    explorer: true,
  });
  // ────────────────────────────────────────────────────────

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway is running on port ${port}`);
}
bootstrap();

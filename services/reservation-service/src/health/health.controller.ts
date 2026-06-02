import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * GET /health
   * Health check endpoint para AWS ALB Target Group
   * Retorna 200 OK con información básica del servicio
   */
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'reservation-service',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

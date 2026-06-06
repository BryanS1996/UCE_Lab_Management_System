import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio operacional' })
  check() {
    return {
      status: 'ok',
      service: 'laboratory-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}

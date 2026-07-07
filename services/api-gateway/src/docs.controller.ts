import { Controller, Get, Param, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';

@Controller('api')
export class DocsController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get(':service/docs-json')
  async getDocsJson(@Param('service') service: string, @Res() res: Response) {
    // Map prefix to environment variable
    const serviceMap: Record<string, string> = {
      auth: 'AUTH_SERVICE_URL',
      reservations: 'RESERVATION_SERVICE_URL',
      laboratories: 'LABORATORY_SERVICE_URL',
      notifications: 'NOTIFICATION_SERVICE_URL',
      catalog: 'CATALOG_SERVICE_URL',
      payments: 'PAYMENT_SERVICE_URL',
      incidents: 'INCIDENT_SERVICE_URL',
    };

    const envVar = serviceMap[service];
    if (!envVar) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const serviceUrl = this.configService.get<string>(envVar);
    if (!serviceUrl) {
      return res.status(500).json({ message: 'Service URL not configured' });
    }

    try {
      // The internal services expose their swagger at /api/docs-json
      const response = await firstValueFrom(
        this.httpService.get(`${serviceUrl}/api/docs-json`),
      );
      return res.json(response.data);
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Failed to fetch swagger JSON from microservice' });
    }
  }
}

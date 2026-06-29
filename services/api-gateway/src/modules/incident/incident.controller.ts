import { Controller, All, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as FormData from 'form-data';

@Controller('api/incidents')
export class IncidentController {
  private readonly incidentServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.incidentServiceUrl = this.configService.get<string>('INCIDENT_SERVICE_URL') || 'http://localhost:3007';
  }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const targetUrl = `${this.incidentServiceUrl}${req.originalUrl}`;
    
    try {
      let data = req.body;
      const headers = { ...req.headers, host: undefined };

      // Handle multipart/form-data for file uploads if needed
      // However, usually we can just pipe the request or pass the body directly 
      // if using raw body or letting express handle it. For simplicity in a proxy,
      // it might be easier to use a proper proxy middleware like http-proxy-middleware 
      // but we will use the existing axios approach. We may need to pass the req buffer directly.
      // NestJS axios might struggle with multipart/form-data out of the box for proxying,
      // so we use the basic axios request.
      
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.method === 'GET' ? undefined : data,
          headers,
          // Si hay problemas con form-data, aquí se necesitaría lógica adicional
        })
      );
      
      res.status(response.status).json(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
      }
    }
  }
}

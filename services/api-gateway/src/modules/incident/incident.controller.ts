import { Controller, All, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import * as http from 'http';

@Controller('api/incidents')
export class IncidentController {
  private readonly incidentServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.incidentServiceUrl =
      this.configService.get<string>('INCIDENT_SERVICE_URL') ||
      'http://localhost:3007';
  }

  @All()
  async proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.handleProxy(req, res);
  }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    return this.handleProxy(req, res);
  }

  private handleProxy(req: Request, res: Response) {
    const targetUrl = new URL(`${this.incidentServiceUrl}${req.originalUrl}`);

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: { ...req.headers, host: targetUrl.host },
    };

    const clientReq = http.request(options, (clientRes: any) => {
      res.writeHead(clientRes.statusCode || 500, clientRes.headers);
      clientRes.pipe(res);
    });

    clientReq.on('error', (e: Error) => {
      res.status(500).json({
        message: 'Internal Server Error (Gateway Proxy)',
        error: e.message,
      });
    });

    // Pipe the raw request stream to the target to preserve multipart/form-data
    req.pipe(clientReq);
  }
}

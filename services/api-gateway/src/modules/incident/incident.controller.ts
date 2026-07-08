import { Controller, All, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import * as http from 'http';
import { CircuitBreakerService } from '../../common/circuit-breaker/circuit-breaker.service';

@Controller('api/incidents')
export class IncidentController {
  private readonly incidentServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.incidentServiceUrl =
      this.configService.get<string>('INCIDENT_SERVICE_URL') ||
      'http://localhost:3007';
  }

  private get breaker() {
    return this.circuitBreaker.getBreaker('incident-service', async (reqFn: () => Promise<void>) => {
      return reqFn();
    });
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
    this.breaker.fire(() => {
      return new Promise<void>((resolve, reject) => {
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
          clientRes.on('end', resolve);
          clientRes.on('error', reject);
        });

        clientReq.on('error', (e: Error) => {
          reject(e);
        });

        // Pipe the raw request stream to the target to preserve multipart/form-data
        req.pipe(clientReq);
      });
    }).catch(e => {
      res.status(503).json({
        message: 'Servicio de incidentes no disponible temporalmente (Circuit Breaker)',
        error: e.message,
      });
    });
  }
}

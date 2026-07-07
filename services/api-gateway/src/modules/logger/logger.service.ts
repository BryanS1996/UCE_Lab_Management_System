import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class LoggerProxyService {
  private readonly loggerServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.loggerServiceUrl =
      this.configService.get<string>('LOGGER_SERVICE_URL') ||
      'http://localhost:3018'; // Fallback port for logger-service
  }

  async getLogs(limit: number, skip: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.loggerServiceUrl}/logs`, {
          params: { limit, skip },
        }),
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException(
        'Error communicating with Logger Service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

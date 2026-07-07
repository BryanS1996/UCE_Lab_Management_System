import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { asyncLocalStorage } from './async-context';
import { CORRELATION_ID_HEADER } from './correlation-id.middleware';

@Injectable()
export class HttpInterceptorService implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    this.httpService.axiosRef.interceptors.request.use((config) => {
      const store = asyncLocalStorage.getStore();
      if (store) {
        const correlationId = store.get(CORRELATION_ID_HEADER);
        if (correlationId) {
          config.headers[CORRELATION_ID_HEADER] = correlationId;
        }
      }
      return config;
    });
  }
}

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from '../../common/circuit-breaker/circuit-breaker.service';

@Injectable()
export class ReservationService {
  private readonly reservationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.reservationServiceUrl = this.configService.get<string>(
      'RESERVATION_SERVICE_URL',
    );
    if (!this.reservationServiceUrl) {
      throw new Error(
        'RESERVATION_SERVICE_URL is not defined in environment variables',
      );
    }
  }

  private get breaker() {
    return this.circuitBreaker.getBreaker('reservation-service', async (requestFn: () => Promise<any>) => {
      return requestFn();
    });
  }

  async getAllReservations(authHeader: string, query?: any) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reservationServiceUrl}/reservations`, {
          headers: { Authorization: authHeader },
          params: query,
        }),
      );
      return response.data;
    });
  }

  async getMyReservations(authHeader: string) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reservationServiceUrl}/reservations/my`, {
          headers: { Authorization: authHeader },
        }),
      );
      return response.data;
    });
  }

  async getAdminStats(authHeader: string) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.reservationServiceUrl}/reservations/admin/stats`,
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return response.data;
    });
  }

  async getReservation(authHeader: string, id: string) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.get(`${this.reservationServiceUrl}/reservations/${id}`, {
          headers: { Authorization: authHeader },
        }),
      );
      return response.data;
    });
  }

  async createReservation(authHeader: string, createDto: any) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.reservationServiceUrl}/reservations`,
          createDto,
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return response.data;
    });
  }

  async confirmReservation(authHeader: string, id: string) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.reservationServiceUrl}/reservations/${id}/confirm`,
          {},
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return response.data;
    });
  }

  async rejectReservation(authHeader: string, id: string) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.reservationServiceUrl}/reservations/${id}/reject`,
          {},
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return response.data;
    });
  }

  async updateReservation(authHeader: string, id: string, updateDto: any) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.reservationServiceUrl}/reservations/${id}`,
          updateDto,
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return response.data;
    });
  }

  async cancelReservation(authHeader: string, id: string) {
    return this.breaker.fire(async () => {
      const response = await firstValueFrom(
        this.httpService.delete(
          `${this.reservationServiceUrl}/reservations/${id}`,
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return response.data;
    });
  }
}

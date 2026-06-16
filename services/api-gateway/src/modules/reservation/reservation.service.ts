import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReservationService {
  private readonly reservationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.reservationServiceUrl = this.configService.get<string>('RESERVATION_SERVICE_URL');
    if (!this.reservationServiceUrl) {
      throw new Error('RESERVATION_SERVICE_URL is not defined in environment variables');
    }
  }

  async getMyReservations(authHeader: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.reservationServiceUrl}/reservations/my`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async getReservation(authHeader: string, id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.reservationServiceUrl}/reservations/${id}`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async createReservation(authHeader: string, createDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.reservationServiceUrl}/reservations`, createDto, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async updateReservation(authHeader: string, id: string, updateDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.reservationServiceUrl}/reservations/${id}`, updateDto, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async cancelReservation(authHeader: string, id: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.reservationServiceUrl}/reservations/${id}`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }
}

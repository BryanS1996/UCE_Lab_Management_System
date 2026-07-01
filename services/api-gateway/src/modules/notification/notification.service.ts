import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>(
      'NOTIFICATION_SERVICE_URL',
    );
    if (!this.notificationServiceUrl) {
      throw new Error(
        'NOTIFICATION_SERVICE_URL is not defined in environment variables',
      );
    }
  }

  async getNotifications(authHeader: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.notificationServiceUrl}/notifications`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async getUnreadCount(authHeader: string) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.notificationServiceUrl}/notifications/unread-count`,
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }

  async markAsRead(authHeader: string, id: string) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.notificationServiceUrl}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }

  async markAllAsRead(authHeader: string) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.notificationServiceUrl}/notifications/read-all`,
        {},
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }
}

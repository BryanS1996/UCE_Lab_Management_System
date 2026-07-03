import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    if (!this.authServiceUrl) {
      throw new Error(
        'AUTH_SERVICE_URL is not defined in environment variables',
      );
    }
  }

  async findAll(authHeader: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/users`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async create(authHeader: string, createUserDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/users`, createUserDto, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async updateRole(authHeader: string, userId: string, role: string) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.authServiceUrl}/users/${userId}/role`,
        { role },
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }

  async updateStatus(authHeader: string, userId: string, isActive: boolean) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.authServiceUrl}/users/${userId}/status`,
        { isActive },
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }

  async deleteUser(authHeader: string, userId: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.authServiceUrl}/users/${userId}`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }
}

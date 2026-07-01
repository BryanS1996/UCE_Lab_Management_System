import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
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

  async register(registerDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.authServiceUrl}/auth/register`,
        registerDto,
      ),
    );
    return response.data;
  }

  async login(loginDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto),
    );
    return response.data;
  }

  async refresh(refreshDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/auth/refresh`, refreshDto),
    );
    return response.data;
  }

  async getMe(authHeader: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/auth/me`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async changePassword(authHeader: string, changePasswordDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.authServiceUrl}/auth/change-password`,
        changePasswordDto,
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }
}

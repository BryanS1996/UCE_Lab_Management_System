import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LaboratoryService {
  private readonly laboratoryServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.laboratoryServiceUrl = this.configService.get<string>(
      'LABORATORY_SERVICE_URL',
    );
    if (!this.laboratoryServiceUrl) {
      throw new Error(
        'LABORATORY_SERVICE_URL is not defined in environment variables',
      );
    }
  }

  async getLaboratories(authHeader: string, query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.laboratoryServiceUrl}/laboratories`, {
        headers: { Authorization: authHeader },
        params: query,
      }),
    );
    return response.data;
  }

  async getLaboratory(authHeader: string, lab_id: string) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.laboratoryServiceUrl}/laboratories/${lab_id}`,
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }

  async createLaboratory(authHeader: string, createDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.laboratoryServiceUrl}/laboratories`,
        createDto,
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }

  async updateLaboratory(authHeader: string, lab_id: string, updateDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.laboratoryServiceUrl}/laboratories/${lab_id}`,
        updateDto,
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }

  async deleteLaboratory(authHeader: string, lab_id: string) {
    const response = await firstValueFrom(
      this.httpService.delete(
        `${this.laboratoryServiceUrl}/laboratories/${lab_id}`,
        {
          headers: { Authorization: authHeader },
        },
      ),
    );
    return response.data;
  }
}

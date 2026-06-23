import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CatalogService {
  private readonly catalogServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.catalogServiceUrl = this.configService.get<string>('CATALOG_SERVICE_URL');
    if (!this.catalogServiceUrl) {
      throw new Error('CATALOG_SERVICE_URL is not defined in environment variables');
    }
  }

  async getPublicCatalog() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.catalogServiceUrl}/catalog`),
    );
    return response.data;
  }

  async getCatalogItem(id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.catalogServiceUrl}/catalog/${id}`),
    );
    return response.data;
  }

  async createCatalogItem(authHeader: string, createDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.catalogServiceUrl}/catalog`, createDto, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async updateCatalogItem(authHeader: string, id: string, updateDto: any) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.catalogServiceUrl}/catalog/${id}`, updateDto, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async deleteCatalogItem(authHeader: string, id: string) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.catalogServiceUrl}/catalog/${id}`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }

  async getAdminCatalog(authHeader: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.catalogServiceUrl}/catalog/admin/all`, {
        headers: { Authorization: authHeader },
      }),
    );
    return response.data;
  }
}

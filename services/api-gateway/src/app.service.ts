import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'UCE Lab Management System - API Gateway';
  }
}

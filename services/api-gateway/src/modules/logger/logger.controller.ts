import { Controller, Get, Query } from '@nestjs/common';
import { LoggerProxyService } from './logger.service';

@Controller('api/logs')
export class LoggerController {
  constructor(private readonly loggerProxyService: LoggerProxyService) {}

  @Get()
  async getLogs(@Query('limit') limit = 100, @Query('skip') skip = 0) {
    return this.loggerProxyService.getLogs(limit, skip);
  }
}

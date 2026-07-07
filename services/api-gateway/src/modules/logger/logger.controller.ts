import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoggerProxyService } from './logger.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('api/logs')
export class LoggerController {
  constructor(private readonly loggerProxyService: LoggerProxyService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getLogs(@Query('limit') limit = 100, @Query('skip') skip = 0) {
    return this.loggerProxyService.getLogs(limit, skip);
  }
}

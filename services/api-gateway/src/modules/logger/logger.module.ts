import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LoggerController } from './logger.controller';
import { LoggerProxyService } from './logger.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [LoggerController],
  providers: [LoggerProxyService],
})
export class LoggerModule {}

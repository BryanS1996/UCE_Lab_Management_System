import { Controller, Get, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './schemas/log.schema';

@Controller('logs')
export class LogsController {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  @Get()
  async getLogs(@Query('limit') limit = 100, @Query('skip') skip = 0) {
    const logs = await this.logModel
      .find()
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .exec();
      
    const total = await this.logModel.countDocuments();
    return { data: logs, total };
  }
}

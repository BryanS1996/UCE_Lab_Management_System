import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

// No @UseGuards here so n8n can access it easily internally.
// In a real production scenario, you would use an API Key guard.
@ApiTags('system-notifications')
@Controller('system/notifications')
export class SystemNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification from an internal system (like n8n)' })
  @ApiResponse({ status: 201, description: 'Notification created and emitted via WS' })
  async createSystemNotification(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }
}

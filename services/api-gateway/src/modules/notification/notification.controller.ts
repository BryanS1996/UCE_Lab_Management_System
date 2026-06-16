import { Controller, Get, Patch, Headers, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(@Headers('authorization') authHeader: string) {
    return this.notificationService.getNotifications(authHeader);
  }

  @Get('unread-count')
  getUnreadCount(@Headers('authorization') authHeader: string) {
    return this.notificationService.getUnreadCount(authHeader);
  }

  @Patch(':id/read')
  markAsRead(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(authHeader, id);
  }

  @Patch('read-all')
  markAllAsRead(@Headers('authorization') authHeader: string) {
    return this.notificationService.markAllAsRead(authHeader);
  }
}

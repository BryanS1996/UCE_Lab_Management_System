import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Obtener mis notificaciones' })
  @ApiQuery({
    name: 'unread_only',
    required: false,
    type: Boolean,
    description: 'Si es true, retorna solo las notificaciones no leídas',
  })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  async getMyNotifications(
    @CurrentUser() user: CurrentUserData,
    @Query('unread_only') unreadOnly?: string,
  ) {
    return this.notificationsService.findByUser(user.user_id, {
      unread_only: unreadOnly === 'true',
    });
  }

  @Get('my/unread-count')
  @ApiOperation({ summary: 'Contador de notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Número de notificaciones sin leer' })
  async getUnreadCount(@CurrentUser() user: CurrentUserData) {
    return this.notificationsService.countUnread(user.user_id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas como leídas' })
  async markAllAsRead(@CurrentUser() user: CurrentUserData) {
    return this.notificationsService.markAllAsRead(user.user_id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiParam({ name: 'id', description: 'UUID de la notificación', type: String })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para leer esta notificación' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.notificationsService.markAsRead(id, user.user_id);
  }
}
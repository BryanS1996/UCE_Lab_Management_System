import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  Notification,
  NotificationStatus,
} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from '../websocket/notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Crea una nueva notificación y hace push via WebSocket al usuario
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...dto,
      status: NotificationStatus.PENDING,
    });

    const saved = await this.notificationRepository.save(notification);
    this.logger.log(
      `Notification created: ${saved.notification_id} for user ${saved.user_id}`,
    );

    // Push real-time via WebSocket
    try {
      this.notificationsGateway.emitToUser(saved.user_id, 'notification', {
        notification_id: saved.notification_id,
        title: saved.title,
        message: saved.message,
        type: saved.type,
        created_at: saved.created_at,
      });

      // Marcar como enviada
      await this.notificationRepository.update(saved.notification_id, {
        status: NotificationStatus.SENT,
      });
      saved.status = NotificationStatus.SENT;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(
        `Failed to emit WebSocket notification: ${errorMessage}`,
      );
      await this.notificationRepository.update(saved.notification_id, {
        status: NotificationStatus.FAILED,
      });
      saved.status = NotificationStatus.FAILED;
    }

    return saved;
  }

  /**
   * Obtiene notificaciones de un usuario, opcionalmente filtradas por is_read
   */
  async findByUser(
    userId: string,
    filters?: { unread_only?: boolean },
  ): Promise<Notification[]> {
    const where: { user_id: string; is_read?: boolean } = { user_id: userId };

    if (filters?.unread_only) {
      where.is_read = false;
    }

    return this.notificationRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { notification_id: id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        'You can only mark your own notifications as read',
      );
    }

    if (!notification.is_read) {
      notification.is_read = true;
      notification.status = NotificationStatus.READ;
      notification.read_at = new Date();
      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      {
        is_read: true,
        status: NotificationStatus.READ,
        read_at: new Date(),
      },
    );

    const updated = result.affected ?? 0;
    this.logger.log(
      `Marked ${updated} notifications as read for user ${userId}`,
    );
    return { updated };
  }

  /**
   * Cuenta las notificaciones no leídas de un usuario
   */
  async countUnread(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
    return { count };
  }

  /**
   * Elimina notificaciones más antiguas que daysOld días
   */
  async deleteOld(daysOld: number): Promise<{ deleted: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      created_at: LessThan(cutoffDate),
    });

    const deleted = result.affected ?? 0;
    this.logger.log(
      `Deleted ${deleted} notifications older than ${daysOld} days`,
    );
    return { deleted };
  }
}

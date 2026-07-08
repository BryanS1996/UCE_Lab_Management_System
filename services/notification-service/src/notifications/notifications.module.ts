import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { SystemNotificationsController } from './system-notifications.controller';
import { NotificationsService } from './notifications.service';
import { WebsocketModule } from '../websocket/websocket.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    WebsocketModule,
    CommonModule,
  ],
  controllers: [NotificationsController, SystemNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

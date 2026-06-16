import { NotificationType } from '../enums';

export class NotificationSentEvent {
  readonly eventType = 'NotificationSent';
  readonly version = '1.0';

  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly channel: 'email' | 'in-app' | 'websocket',
    public readonly timestamp: Date = new Date(),
  ) {}
}

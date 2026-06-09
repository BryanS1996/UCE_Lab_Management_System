import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ',
}

export enum NotificationType {
  RESERVATION_CREATED = 'RESERVATION_CREATED',
  RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED',
  RESERVATION_CANCELLED = 'RESERVATION_CANCELLED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  read_at: Date;
}

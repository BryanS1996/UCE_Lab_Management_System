import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('reservations')
export class Reservation {
  @PrimaryColumn('uuid')
  reservation_id!: string;

  @Column('uuid')
  laboratory_id!: string;

  @Column('uuid')
  user_id!: string;

  @Column('timestamp')
  start_time!: Date;

  @Column('timestamp')
  end_time!: Date;

  @Column('varchar', { length: 500, nullable: true })
  purpose?: string;

  @Column({
    type: 'varchar',
    default: ReservationStatus.PENDING,
    enum: ReservationStatus,
  })
  status: ReservationStatus = ReservationStatus.PENDING;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @VersionColumn()
  version!: number;
}

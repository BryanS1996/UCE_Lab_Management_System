import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Laboratory } from './laboratory.entity';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid', { name: 'reservation_id' })
  reservation_id!: string;

  @Column('uuid', { name: 'user_id' })
  user_id!: string;

  @Column('int', { name: 'lab_id' })
  lab_id!: number;

  @Column('timestamp with time zone', { name: 'start_time' })
  start_time!: Date;

  @Column('timestamp with time zone', { name: 'end_time' })
  end_time!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus = ReservationStatus.PENDING;

  @Column('varchar', { length: 500, nullable: true })
  purpose?: string;

  @Column('varchar', { length: 1000, nullable: true })
  notes?: string;

  @Column('boolean', { default: false, name: 'requires_payment' })
  requires_payment: boolean = false;

  @VersionColumn()
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // Relación ManyToOne con Laboratory (sin FK constraint cross-service)
  @ManyToOne(() => Laboratory, { nullable: true, eager: false })
  @JoinColumn({ name: 'lab_id', referencedColumnName: 'lab_id' })
  laboratory?: Laboratory;
}

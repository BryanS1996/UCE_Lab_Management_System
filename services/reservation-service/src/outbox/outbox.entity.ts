import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

@Entity('outbox')
export class Outbox {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  aggregateType!: string;

  @Column()
  aggregateId!: string;

  @Column()
  eventType!: string;

  @Column('jsonb')
  payload: any;

  @Column({
    type: 'enum',
    enum: OutboxStatus,
    default: OutboxStatus.PENDING,
  })
  status!: OutboxStatus;

  @Column({ nullable: true })
  correlationId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

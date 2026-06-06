import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Laboratory } from './laboratory.entity';

export enum ResourceType {
  COMPUTER = 'COMPUTER',
  PROJECTOR = 'PROJECTOR',
  WHITEBOARD = 'WHITEBOARD',
  EQUIPMENT = 'EQUIPMENT',
  SOFTWARE = 'SOFTWARE',
  OTHER = 'OTHER',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn()
  resource_id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ResourceType, default: ResourceType.EQUIPMENT })
  type: ResourceType;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ default: true })
  is_available: boolean;

  @Column({ type: 'int' })
  lab_id: number;

  @ManyToOne(() => Laboratory, (l) => l.resources)
  @JoinColumn({ name: 'lab_id' })
  laboratory: Laboratory;

  @CreateDateColumn()
  created_at: Date;
}

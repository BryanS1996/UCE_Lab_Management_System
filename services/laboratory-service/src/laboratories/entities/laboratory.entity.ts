import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  VersionColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

export enum LaboratoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum LaboratoryTier {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

@Entity('laboratories')
export class Laboratory {
  @PrimaryGeneratedColumn()
  lab_id: number;

  @Column({ unique: true, length: 200 })
  name: string;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ nullable: true, length: 200 })
  location: string;

  @Column({ type: 'int', default: 30 })
  max_capacity: number;

  @Column({
    type: 'enum',
    enum: LaboratoryStatus,
    default: LaboratoryStatus.ACTIVE,
  })
  status: LaboratoryStatus;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: LaboratoryTier,
    default: LaboratoryTier.BASIC,
  })
  tier: LaboratoryTier;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @VersionColumn()
  version: number;

  @OneToMany(() => Resource, (r) => r.laboratory, { cascade: true })
  resources: Resource[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

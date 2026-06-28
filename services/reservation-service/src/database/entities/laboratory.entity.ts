import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reservation } from './reservation.entity';

export enum LaboratoryTier {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

@Entity('laboratories')
export class Laboratory {
  @PrimaryGeneratedColumn({ name: 'lab_id' })
  lab_id!: number;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('int', { name: 'max_capacity' })
  max_capacity!: number;

  @Column('boolean', { default: true, name: 'is_active' })
  is_active: boolean = true;

  @Column({
    type: 'varchar',
    length: 20,
    default: LaboratoryTier.BASIC,
  })
  tier: LaboratoryTier = LaboratoryTier.BASIC;

  @Column('varchar', { length: 100, nullable: true })
  location?: string;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.laboratory, {
    lazy: true,
  })
  reservations?: Reservation[];
}

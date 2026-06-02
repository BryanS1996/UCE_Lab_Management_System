import { Entity, PrimaryColumn, Column } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity('laboratories')
export class Laboratory {
  @PrimaryColumn('uuid')
  laboratory_id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('int')
  max_capacity!: number;

  @Column('boolean', { default: true })
  is_active!: boolean;
}

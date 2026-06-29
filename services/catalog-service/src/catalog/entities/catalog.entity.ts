import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CatalogItemStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum CatalogItemTier {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

@Entity('catalog_items')
export class CatalogItem {
  @PrimaryColumn()
  laboratory_id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: false })
  is_published: boolean;

  @Column({
    type: 'enum',
    enum: CatalogItemStatus,
    default: CatalogItemStatus.AVAILABLE,
  })
  current_status: CatalogItemStatus;

  @Column({
    type: 'enum',
    enum: CatalogItemTier,
    default: CatalogItemTier.BASIC,
  })
  tier: CatalogItemTier;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

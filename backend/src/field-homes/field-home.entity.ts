import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('field_homes')
export class FieldHome {
  @PrimaryColumn({ name: 'field_slug', length: 40 })
  fieldSlug: string;

  @Column({ length: 160 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ length: 200, default: '' })
  tagline: string;

  /** 분야 로고 data URL (없으면 프론트 기본 사이트 로고) */
  @Column({ name: 'logo_data_url', type: 'longtext', nullable: true })
  logoDataUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

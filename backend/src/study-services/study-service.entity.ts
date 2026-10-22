import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('study_services')
export class StudyService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'short_name', length: 8, default: 'FD' })
  shortName: string;

  @Column({ type: 'text' })
  description: string;

  /** URL path slug — /{path} */
  @Column({ unique: true, length: 40 })
  path: string;

  @Column({ type: 'boolean', default: false })
  builtin: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

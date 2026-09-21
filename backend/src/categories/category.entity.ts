import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity('categories')
@Index(['fieldSlug', 'slug'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  slug: string;

  @Column({ length: 120 })
  label: string;

  /** 상단 네비 짧은 이름 */
  @Column({ name: 'nav_label', type: 'varchar', length: 40, nullable: true })
  navLabel: string | null;

  @Column({ type: 'text', default: '' })
  description: string;

  /** 학습 분야 URL 세그먼트 (예: react) */
  @Column({ name: 'field_slug', length: 40, default: 'react' })
  fieldSlug: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: false })
  builtin: boolean;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

@Entity('posts')
@Index(['fieldSlug', 'slug'], { unique: true })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  slug: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'field_slug', length: 40, default: 'react' })
  fieldSlug: string;

  @Column({ type: 'varchar', length: 20 })
  difficulty: Difficulty;

  @Column({ name: 'reading_time', length: 40, default: '1 min' })
  readingTime: string;

  @Column({ type: 'mediumtext' })
  body: string;

  @Column({ type: 'boolean', default: true })
  published: boolean;

  /** 카테고리 내 표시 순서 */
  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Category, (category) => category.posts, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'author_id' })
  authorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

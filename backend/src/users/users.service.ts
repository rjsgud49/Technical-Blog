import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SeedService } from './seed.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly seed: SeedService,
  ) {}

  async onModuleInit() {
    await this.seed.run();
  }

  findByUsername(username: string) {
    return this.users.findOne({ where: { username } });
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }
}

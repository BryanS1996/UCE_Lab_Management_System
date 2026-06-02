import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll() {
    return this.usersRepository.find({
      relations: ['roles'],
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByIdWithPassword(id: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.password')
      .getOne();
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findByEmailWithPassword(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .leftJoinAndSelect('user.roles', 'roles')
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async updatePassword(id: string, hashedPassword: string) {
    return this.usersRepository.update(id, { password: hashedPassword });
  }

  async remove(id: string) {
    return this.usersRepository.softDelete(id);
  }
}

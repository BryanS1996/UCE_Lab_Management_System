import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role, RoleName } from '../database/entities';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { role, ...userData } = createUserDto;

    // Hash password inside service logic
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = this.usersRepository.create(userData);

    const roleName = role || RoleName.STUDENT;
    const userRole = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (userRole) {
      user.roles = [userRole];
    }

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

  async updateRole(id: string, roleName: RoleName) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) return null;
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (role) {
      user.roles = [role];
      await this.usersRepository.save(user);
    }
    return this.findById(id);
  }

  async updateStatus(id: string, isActive: boolean) {
    await this.usersRepository.update(id, { isActive });
    return this.findById(id);
  }

  async remove(id: string) {
    return this.usersRepository.softDelete(id);
  }
}

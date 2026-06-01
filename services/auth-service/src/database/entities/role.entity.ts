import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';

export enum RoleName {
  ADMIN = 'admin',
  PROFESSOR = 'professor',
  STUDENT = 'student',
  LAB_MANAGER = 'lab_manager',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, enum: RoleName })
  name: RoleName;

  @Column()
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}

import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role, RoleName } from '../database/entities';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking for default admin user...');

    // Ensure ADMIN role exists
    let adminRole = await this.roleRepository.findOne({ where: { name: RoleName.ADMIN } });
    if (!adminRole) {
      adminRole = this.roleRepository.create({
        name: RoleName.ADMIN,
        description: 'Super Administrador del Sistema',
      });
      await this.roleRepository.save(adminRole);
    }

    // Check if admin user exists
    const adminEmail = 'admin@uce.edu.ec';
    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      this.logger.log(`Creating default admin user: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash('Admin1234!', 10);
      
      const newAdmin = this.userRepository.create({
        email: adminEmail,
        firstName: 'Super',
        lastName: 'Admin',
        password: hashedPassword,
        isActive: true,
        roles: [adminRole],
      });

      await this.userRepository.save(newAdmin);
      this.logger.log(`✅ Super administrador ${adminEmail} inicializado correctamente.`);
    } else {
      // Ensure the existing admin has the ADMIN role
      const hasAdminRole = await this.userRepository.findOne({
        where: { email: adminEmail },
        relations: ['roles'],
      });
      
      const roleExists = hasAdminRole?.roles?.find((r) => r.name === RoleName.ADMIN);
      if (!roleExists && hasAdminRole) {
        hasAdminRole.roles = [...(hasAdminRole.roles || []), adminRole];
        await this.userRepository.save(hasAdminRole);
        this.logger.log(`✅ Rol ADMIN asignado al usuario existente ${adminEmail}.`);
      } else {
        this.logger.log(`Admin user ${adminEmail} already exists.`);
      }
    }
  }
}

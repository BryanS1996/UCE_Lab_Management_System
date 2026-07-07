import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Laboratory } from '../laboratories/entities/laboratory.entity';
import { Resource } from '../laboratories/entities/resource.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5436),
  username: configService.get<string>('DB_USERNAME', 'labuser'),
  password: configService.get<string>('DB_PASSWORD', 'labpassword'),
  database: configService.get<string>('DB_NAME', 'laboratory_service'),
  ssl:
    configService.get<string>('DB_SSL') === 'true'
      ? { rejectUnauthorized: false }
      : false,
  entities: [Laboratory, Resource],
  synchronize: true, // No hay migraciones definidas; auto-crear tablas en todos los ambientes
  logging: configService.get<string>('NODE_ENV') === 'development',
});

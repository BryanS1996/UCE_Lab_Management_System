import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies';
import { User, Role } from '../database/entities';
import { UsersModule } from '../users/users.module';
import { AdminSeederService } from './admin-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
          issuer: 'auth-service',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, AdminSeederService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

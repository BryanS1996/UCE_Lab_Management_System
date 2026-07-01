import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { RoleName } from '../../database/entities/role.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token JWT (7 días)' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

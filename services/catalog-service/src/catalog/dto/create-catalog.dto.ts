import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { CatalogItemStatus } from '../entities/catalog.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCatalogDto {
  @ApiProperty({ description: 'ID del laboratorio proveniente del laboratory-service' })
  @IsNumber()
  laboratory_id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  capacity?: number;
}

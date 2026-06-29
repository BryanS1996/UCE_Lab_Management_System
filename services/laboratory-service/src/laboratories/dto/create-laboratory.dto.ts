import { IsString, IsInt, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LaboratoryStatus, LaboratoryTier } from '../entities/laboratory.entity';

export class CreateLaboratoryDto {
  @ApiProperty({ example: 'Laboratorio de Computación A' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Laboratorio equipado con 30 PCs' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Bloque A, Piso 2' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  @Max(200)
  max_capacity: number;

  @ApiPropertyOptional({ enum: LaboratoryStatus })
  @IsOptional()
  @IsEnum(LaboratoryStatus)
  status?: LaboratoryStatus;

  @ApiPropertyOptional({ enum: LaboratoryTier })
  @IsOptional()
  @IsEnum(LaboratoryTier)
  tier?: LaboratoryTier;
}

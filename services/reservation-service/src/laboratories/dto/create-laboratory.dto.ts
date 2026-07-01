import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Length,
} from 'class-validator';

import { LaboratoryTier, LaboratoryStatus } from '../../database/entities/laboratory.entity';

export class CreateLaboratoryDto {
  @IsOptional()
  @IsInt()
  lab_id?: number;

  @IsNotEmpty({ message: 'El nombre del laboratorio es requerido' })
  @IsString()
  @Length(2, 255)
  name!: string;

  @IsNotEmpty({ message: 'La capacidad máxima es requerida' })
  @IsInt()
  @Min(1, { message: 'La capacidad debe ser al menos 1' })
  @Max(500, { message: 'La capacidad no puede exceder 500' })
  max_capacity!: number;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @IsOptional()
  status?: LaboratoryStatus;

  @IsOptional()
  tier?: LaboratoryTier;
}

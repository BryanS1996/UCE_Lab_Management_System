import {
  IsInt,
  IsDateString,
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty({ message: 'El ID del laboratorio es requerido' })
  @IsInt()
  @Min(1)
  lab_id!: number;

  @IsNotEmpty({ message: 'La hora de inicio es requerida' })
  @IsDateString()
  start_time!: string;

  @IsNotEmpty({ message: 'La hora de fin es requerida' })
  @IsDateString()
  end_time!: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  purpose?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
}

import {
  IsInt,
  IsDateString,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
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
  @MaxLength(500, { message: 'El motivo de la reserva no puede superar los 500 caracteres' })
  purpose?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden superar los 1000 caracteres' })
  notes?: string;

  @IsNotEmpty({ message: 'El número de asistentes es requerido' })
  @IsInt()
  @Min(1, { message: 'Debe haber al menos 1 asistente' })
  attendees!: number;
}

import { IsOptional, IsInt, IsDateString, IsString, IsEnum, Length, Min } from 'class-validator';
import { ReservationStatus } from '../../database/entities';

export class UpdateReservationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  lab_id?: number;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  purpose?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}

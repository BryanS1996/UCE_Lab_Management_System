import {
  IsUUID,
  IsDateString,
  IsString,
  IsEnum,
  IsOptional,
  Length,
} from 'class-validator';
import { ReservationStatus } from '../../database/entities';
import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  purpose?: string;
}

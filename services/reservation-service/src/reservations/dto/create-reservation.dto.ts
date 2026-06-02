import {
  IsUUID,
  IsDateString,
  IsString,
  IsNotEmpty,
  Length,
  ValidateIf,
} from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsUUID()
  laboratory_id!: string;

  @IsNotEmpty()
  @IsUUID()
  user_id!: string;

  @IsNotEmpty()
  @IsDateString()
  start_time!: string;

  @IsNotEmpty()
  @IsDateString()
  end_time!: string;

  @ValidateIf((o) => o.purpose !== undefined)
  @IsString()
  @Length(1, 500)
  purpose?: string;
}

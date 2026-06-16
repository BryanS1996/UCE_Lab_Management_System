import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@uce\.edu\.ec$/i, {
    message: 'El correo electrónico debe pertenecer al dominio institucional @uce.edu.ec',
  })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto';
import { JwtAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema. La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado exitosamente. Retorna access token y refresh token.',
  })
  @ApiResponse({
    status: 400,
    description: 'El usuario ya existe o los datos son inválidos.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario y retorna JWT access token (15min) y refresh token (7d).',
  })
  @ApiResponse({
    status: 200,
    description:
      'Login exitoso. Retorna accessToken, refreshToken y datos del usuario.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar access token',
    description:
      'Intercambia un refresh token válido (7d) por un nuevo par access + refresh token.',
  })
  @ApiResponse({ status: 200, description: 'Tokens renovados.' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado.',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Post('change-password')
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Permite al usuario autenticado cambiar su contraseña.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o contraseña actual incorrecta.',
  })
  async changePassword(
    @Request() req: { user: { id: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('me')
  @ApiOperation({
    summary: 'Obtener usuario autenticado',
    description: 'Retorna los datos del usuario actualmente autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Datos del usuario autenticado.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  getCurrentUser(
    @Request()
    req: {
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        roles: any[];
      };
    },
  ) {
    return {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      roles: req.user.roles,
    };
  }
}

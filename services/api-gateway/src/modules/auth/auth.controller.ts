import { Controller, Post, Body, Get, Headers, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshDto: any) {
    return this.authService.refresh(refreshDto);
  }

  @Get('me')
  getMe(@Headers('authorization') authHeader: string) {
    return this.authService.getMe(authHeader);
  }

  @Patch('change-password')
  changePassword(
    @Headers('authorization') authHeader: string,
    @Body() changePasswordDto: any,
  ) {
    return this.authService.changePassword(authHeader, changePasswordDto);
  }
}

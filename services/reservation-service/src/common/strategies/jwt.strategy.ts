import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[];
  role?: string;
  iss?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      issuer: 'auth-service',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      user_id: payload.sub,
      email: payload.email,
      roles: payload.roles?.map(r => r.toUpperCase()) || (payload.role ? [payload.role.toUpperCase()] : []),
    };
  }
}

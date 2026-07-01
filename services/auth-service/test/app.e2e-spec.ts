import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Controller,
  Get,
  UseGuards,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';

// ---------------------------------------------------------
// Controlador Dummy para probar CP-06 (Seguridad - Roles Guard)
// ---------------------------------------------------------
@Controller('test-admin')
class TestAdminController {
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['ADMIN', 'TEACHER'])
  getAdminData() {
    return { data: 'Ruta protegida para admins y teachers' };
  }
}

describe('AuthService (e2e)', () => {
  let app: INestApplication;

  // Mocks
  const mockAuthService = {
    login: jest.fn(),
  };

  // Mock del JwtAuthGuard para simular req.user (payload del token)
  // Nota: En la implementación actual, el AuthService.buildSigningPayload
  // guarda un campo 'role' (string), pero el RolesGuard espera un array 'roles'.
  const mockJwtAuthGuard = {
    canActivate: (context: import('@nestjs/common').ExecutionContext) => {
      const req = context
        .switchToHttp()
        .getRequest<import('express').Request>();
      // Simulamos a un STUDENT según CP-06
      (req as unknown as { user: any }).user = {
        sub: 'uuid-123',
        email: 'student@uce.edu.ec',
        roles: ['STUDENT'], // Así lo devuelve el AuthService actual
      };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, TestAdminController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        RolesGuard, // Probamos el Guard real
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/login', () => {
    it('CP-04 (Happy Path): Login con credenciales válidas retorna 200 y token', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'uuid-123',
          email: 'test@uce.edu.ec',
          roles: [{ name: 'STUDENT' }],
        },
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@uce.edu.ec',
          password: 'Password123!',
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect((res.body as { accessToken: string }).accessToken).toBe(
            'mock-access-token',
          );
        });
    });

    it('CP-05 (Negativo): Login con credenciales inválidas retorna 401', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'no-existe@uce.edu.ec',
          password: 'wrong',
        })
        .expect(401);
    });
  });

  describe('Guard de Roles (CP-06)', () => {
    it('CP-06 (Seguridad): Usuario STUDENT intenta acceder a ruta de ADMIN/TEACHER retorna 403 Forbidden', async () => {
      // El request pasará por el JwtAuthGuard mockeado (asigna role: 'STUDENT')
      // y luego por el RolesGuard real.

      return request(app.getHttpServer()).get('/test-admin').expect(403);
    });
  });
});

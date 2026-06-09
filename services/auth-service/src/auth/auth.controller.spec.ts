import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should delegate to AuthService', async () => {
    const dto = { email: 'a@b.com', password: 'Test1234!' };
    const tokens = { accessToken: 'a', refreshToken: 'r', user: {} };
    mockAuthService.login.mockResolvedValue(tokens);

    await expect(controller.login(dto)).resolves.toEqual(tokens);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('refresh should delegate to AuthService', async () => {
    const dto = { refreshToken: 'refresh-jwt' };
    const tokens = { accessToken: 'new-a', refreshToken: 'new-r', user: {} };
    mockAuthService.refreshTokens.mockResolvedValue(tokens);

    await expect(controller.refresh(dto)).resolves.toEqual(tokens);
    expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('refresh-jwt');
  });

  it('getCurrentUser should map req.user fields', async () => {
    const req = {
      user: {
        id: 'uuid',
        email: 'a@b.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        roles: [{ name: 'STUDENT' }],
      },
    };

    await expect(controller.getCurrentUser(req)).resolves.toEqual({
      id: 'uuid',
      email: 'a@b.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      roles: [{ name: 'STUDENT' }],
    });
  });
});

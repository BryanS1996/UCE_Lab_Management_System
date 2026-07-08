import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findById: jest.fn(),
    findByIdWithPassword: jest.fn(),
    create: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUser = {
    id: 'user-uuid-1',
    email: 'student@uce.edu.ec',
    firstName: 'Juan',
    lastName: 'Pérez',
    password: 'hashed-password',
    isActive: true,
    roles: [{ name: 'STUDENT' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('CP-04 (Happy Path - Login): Credenciales válidas. Valida hash y retorna token', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login({
        email: mockUser.email,
        password: 'Test1234!',
      });

      // Valida RNF-01: Verificación de contraseñas encriptadas
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'Test1234!',
        mockUser.password,
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id, email: mockUser.email, roles: ['STUDENT'] },
        { expiresIn: '15m' },
      );
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: mockUser.roles,
      });
    });

    it('CP-05 (Negativo - Login): Correo que no existe. Lanza UnauthorizedException', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no-existe@uce.edu.ec', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('CP-05 (Negativo - Login): Contraseña incorrecta. Lanza UnauthorizedException', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);

      // Valida RNF-01
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        mockUser.password,
      );
    });
  });

  describe('register', () => {
    it('should throw BadRequestException when user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: mockUser.email,
          firstName: 'A',
          lastName: 'B',
          password: 'Test1234!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create user and return tokens, respetando RNF-01 (contraseña encriptada)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password-123');
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.register({
        email: 'new@uce.edu.ec',
        firstName: 'Ana',
        lastName: 'López',
        password: 'MySecretPassword!',
      });

      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@uce.edu.ec',
          password: 'MySecretPassword!', // El encriptado ahora se delega al UsersService
        }),
      );

      expect(result.accessToken).toBe('access-token');
    });
  });

  describe('refreshTokens', () => {
    it('should issue new tokens for a valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        roles: ['STUDENT'],
        iss: 'auth-service',
      });
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('new-access')
        .mockReturnValueOnce('new-refresh');

      const result = await service.refreshTokens('valid-refresh-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'valid-refresh-token',
        {
          issuer: 'auth-service',
        },
      );
      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
    });

    it('should throw when refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshTokens('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when user is inactive', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        roles: ['STUDENT'],
      });
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.refreshTokens('valid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

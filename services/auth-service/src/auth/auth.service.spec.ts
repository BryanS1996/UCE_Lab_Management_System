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
    it('should return tokens with RFC 7519 payload on valid credentials', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login({
        email: mockUser.email,
        password: 'Test1234!',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id, email: mockUser.email, role: 'STUDENT' },
        { expiresIn: '15m' },
      );
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        { sub: mockUser.id, email: mockUser.email, role: 'STUDENT' },
        { expiresIn: '7d' },
      );
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: mockUser.roles,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@uce.edu.ec', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
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

    it('should create user and return tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.register({
        email: 'new@uce.edu.ec',
        firstName: 'Ana',
        lastName: 'López',
        password: 'Test1234!',
      });

      expect(mockUsersService.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('access-token');
    });
  });

  describe('refreshTokens', () => {
    it('should issue new tokens for a valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        role: 'STUDENT',
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
        role: 'STUDENT',
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

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CaptchaService } from './captcha.service';
import { WechatService } from './wechat.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let captchaService: any;
  let wechatService: any;

  const mockUser = {
    id: 'user-1',
    phone: '13800138000',
    password: '$2a$10$hashedpassword',
    nickname: '测试用户',
    avatarUrl: null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      resetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
    };

    captchaService = {
      verify: jest.fn().mockReturnValue(true),
    };

    wechatService = {
      mpCode2Session: jest.fn(),
      appCode2AccessToken: jest.fn(),
      getAppUserInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: CaptchaService, useValue: captchaService },
        { provide: WechatService, useValue: wechatService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      const result = await service.login({ phone: '13800138000', password: 'password123' });

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.phone).toBe('13800138000');
    });

    it('should throw on non-existent phone', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ phone: '13900000000', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on wrong password', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      await expect(
        service.login({ phone: '13800138000', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user',
        phone: '13800138001',
        nickname: '用户8001',
        avatarUrl: null,
        role: 'USER',
        createdAt: new Date(),
      });

      const result = await service.register({
        phone: '13800138001',
        password: 'pass123',
        captchaId: 'cap-1',
        captchaAnswer: 'ABCD',
      });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.phone).toBe('13800138001');
    });

    it('should throw on duplicate phone', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          phone: '13800138000',
          password: 'pass123',
          captchaId: 'cap-1',
          captchaAnswer: 'ABCD',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw on invalid captcha', async () => {
      captchaService.verify.mockReturnValue(false);

      await expect(
        service.register({
          phone: '13800138002',
          password: 'pass123',
          captchaId: 'cap-1',
          captchaAnswer: 'WRONG',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should update password on valid old password', async () => {
      const hashed = await bcrypt.hash('oldpass', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword('user-1', 'oldpass', 'newpass123');
      expect(result.message).toBe('密码修改成功');
    });

    it('should throw on wrong old password', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      await expect(
        service.changePassword('user-1', 'wrongold', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw on short new password', async () => {
      await expect(
        service.changePassword('user-1', 'old', '12345'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

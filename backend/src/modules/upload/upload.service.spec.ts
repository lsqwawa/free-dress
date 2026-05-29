import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('uploadImage', () => {
    it('should throw if no file provided', () => {
      expect(() => service.uploadImage(null as any)).toThrow(BadRequestException);
    });

    it('should throw on invalid mimetype', () => {
      const file = {
        fieldname: 'file',
        originalname: 'malware.exe',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        size: 1000,
        buffer: Buffer.from([0x4D, 0x5A]), // MZ header (exe)
      };

      expect(() => service.uploadImage(file)).toThrow(BadRequestException);
    });

    it('should throw if magic bytes dont match image', () => {
      const file = {
        fieldname: 'file',
        originalname: 'fake.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg', // claims JPEG
        size: 1000,
        buffer: Buffer.from([0x50, 0x4B, 0x03, 0x04]), // actually ZIP
      };

      expect(() => service.uploadImage(file)).toThrow('文件内容与声明类型不符');
    });

    it('should throw on file exceeding 10MB', () => {
      // Valid JPEG header
      const header = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      const file = {
        fieldname: 'file',
        originalname: 'big.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024,
        buffer: header,
      };

      expect(() => service.uploadImage(file)).toThrow('图片大小不能超过 10MB');
    });

    it('should successfully upload valid JPEG', () => {
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      const file = {
        fieldname: 'file',
        originalname: 'photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 50000,
        buffer: jpegHeader,
      };

      const result = service.uploadImage(file);
      expect(result.url).toMatch(/^\/uploads\/.*\.jpg$/);
    });

    it('should successfully upload valid PNG', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const file = {
        fieldname: 'file',
        originalname: 'image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 30000,
        buffer: pngHeader,
      };

      const result = service.uploadImage(file);
      expect(result.url).toMatch(/^\/uploads\/.*\.png$/);
    });
  });
});

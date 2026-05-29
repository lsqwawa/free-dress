import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { v4 as uuid } from 'uuid';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * 文件类型 magic bytes 签名
 * 用于验证文件实际内容类型，防止 mimetype 伪造
 */
const MAGIC_BYTES: { mime: string; signatures: number[][] }[] = [
  { mime: 'image/jpeg', signatures: [[0xFF, 0xD8, 0xFF]] },
  { mime: 'image/png', signatures: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]] },
  { mime: 'image/webp', signatures: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF header
  { mime: 'image/gif', signatures: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]] },
];

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  uploadImage(file: MulterFile): { url: string } {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片');
    }

    // 检查 mimetype（第一层防护）
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 JPG/PNG/WebP/GIF 格式');
    }

    // 验证 magic bytes（第二层防护，防止 mimetype 伪造）
    const detectedMime = this.detectMimeByMagicBytes(file.buffer);
    if (!detectedMime || !allowedMimes.includes(detectedMime)) {
      throw new BadRequestException('文件内容与声明类型不符，请上传真实图片文件');
    }

    // 文件大小限制
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('图片大小不能超过 10MB');
    }

    const ext = this.getExtFromMime(detectedMime);
    const filename = `${uuid()}${ext}`;
    const filepath = join(this.uploadDir, filename);

    writeFileSync(filepath, file.buffer);

    return { url: `/uploads/${filename}` };
  }

  /**
   * 通过文件头 magic bytes 检测真实 MIME 类型
   */
  private detectMimeByMagicBytes(buffer: Buffer): string | null {
    if (!buffer || buffer.length < 8) return null;

    for (const { mime, signatures } of MAGIC_BYTES) {
      for (const sig of signatures) {
        if (this.bufferStartsWith(buffer, sig)) {
          return mime;
        }
      }
    }
    return null;
  }

  /**
   * 检查 Buffer 是否以指定字节序列开头
   */
  private bufferStartsWith(buffer: Buffer, signature: number[]): boolean {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) return false;
    }
    return true;
  }

  /**
   * 从 MIME 类型获取文件扩展名
   */
  private getExtFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return map[mime] || '.jpg';
  }
}

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

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 JPG/PNG/WebP/GIF 格式');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('图片大小不能超过 10MB');
    }

    const ext = extname(file.originalname) || '.jpg';
    const filename = `${uuid()}${ext}`;
    const filepath = join(this.uploadDir, filename);

    writeFileSync(filepath, file.buffer);

    return { url: `/uploads/${filename}` };
  }
}

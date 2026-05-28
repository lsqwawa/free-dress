import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

/**
 * 验证码存储条目
 */
interface CaptchaEntry {
  answer: string;
  createdAt: number;
  attempts: number;
}

/**
 * IP 限流记录
 */
interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

/**
 * 图片验证码服务
 * 生成带噪声干扰的 SVG 验证码，内存存储答案
 * 防自动化措施：
 * 1. 字符扭曲 + 噪声线条 + 干扰点
 * 2. 验证码 2 分钟过期
 * 3. 单个验证码最多验证 3 次
 * 4. IP 限流（每分钟最多 10 次请求）
 */
@Injectable()
export class CaptchaService {
  // 验证码存储（生产环境应使用 Redis）
  private readonly store = new Map<string, CaptchaEntry>();
  // IP 限流存储
  private readonly rateLimit = new Map<string, RateLimitEntry>();
  // 验证码有效期 2 分钟
  private readonly CAPTCHA_TTL = 2 * 60 * 1000;
  // 最大验证尝试次数
  private readonly MAX_ATTEMPTS = 3;
  // 限流窗口 1 分钟
  private readonly RATE_LIMIT_WINDOW = 60 * 1000;
  // 限流阈值
  private readonly RATE_LIMIT_MAX = 10;

  // 可用字符（去除易混淆字符 0/O, 1/I/l）
  private readonly CHARS = '2345679ABCDEFGHJKLMNPQRSTUVWXYZ';

  constructor() {
    // 定期清理过期验证码
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * 生成验证码
   * @param ip 客户端IP（用于限流）
   * @returns captchaId 和 SVG 图片数据
   */
  generate(ip?: string): { captchaId: string; image: string } {
    // IP 限流检查
    if (ip) {
      this.checkRateLimit(ip);
    }

    // 生成 4 位随机字符
    const answer = this.generateRandomText(4);
    const captchaId = uuid();

    // 存储验证码
    this.store.set(captchaId, {
      answer: answer.toUpperCase(),
      createdAt: Date.now(),
      attempts: 0,
    });

    // 生成带干扰的 SVG 图片
    const image = this.generateSvg(answer);

    return { captchaId, image };
  }

  /**
   * 验证验证码
   * @param captchaId 验证码ID
   * @param answer 用户输入的答案
   * @returns 验证是否通过
   */
  verify(captchaId: string, answer: string): boolean {
    if (!captchaId || !answer) {
      throw new BadRequestException('验证码不能为空');
    }

    const entry = this.store.get(captchaId);

    if (!entry) {
      throw new BadRequestException('验证码已过期，请重新获取');
    }

    // 检查是否过期
    if (Date.now() - entry.createdAt > this.CAPTCHA_TTL) {
      this.store.delete(captchaId);
      throw new BadRequestException('验证码已过期，请重新获取');
    }

    // 检查尝试次数
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      this.store.delete(captchaId);
      throw new BadRequestException('验证码尝试次数过多，请重新获取');
    }

    // 增加尝试次数
    entry.attempts++;

    // 比较答案（不区分大小写）
    const isValid = entry.answer === answer.toUpperCase().trim();

    // 验证成功或用尽次数后删除
    if (isValid || entry.attempts >= this.MAX_ATTEMPTS) {
      this.store.delete(captchaId);
    }

    return isValid;
  }

  /**
   * 生成随机文本
   */
  private generateRandomText(length: number): string {
    let text = '';
    for (let i = 0; i < length; i++) {
      text += this.CHARS[Math.floor(Math.random() * this.CHARS.length)];
    }
    return text;
  }

  /**
   * 生成 SVG 验证码图片
   * 包含：字符扭曲、噪声线条、干扰点、渐变背景
   */
  private generateSvg(text: string): string {
    const width = 150;
    const height = 50;
    const chars = text.split('');

    // 随机颜色生成（深色系，确保可读性）
    const textColor = () => {
      const r = Math.floor(Math.random() * 80) + 20;
      const g = Math.floor(Math.random() * 80) + 20;
      const b = Math.floor(Math.random() * 80) + 20;
      return `rgb(${r},${g},${b})`;
    };

    // 浅色线条颜色
    const lineColor = () => {
      const r = Math.floor(Math.random() * 100) + 120;
      const g = Math.floor(Math.random() * 100) + 120;
      const b = Math.floor(Math.random() * 100) + 120;
      return `rgb(${r},${g},${b})`;
    };

    // 生成干扰线条 (5-8条)
    const lineCount = Math.floor(Math.random() * 4) + 5;
    let lines = '';
    for (let i = 0; i < lineCount; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      const strokeWidth = Math.random() * 1.5 + 0.5;
      lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor()}" stroke-width="${strokeWidth}" opacity="${Math.random() * 0.5 + 0.3}"/>`;
    }

    // 生成干扰点 (20-40个)
    const dotCount = Math.floor(Math.random() * 20) + 20;
    let dots = '';
    for (let i = 0; i < dotCount; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = Math.random() * 2 + 0.5;
      dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${lineColor()}" opacity="${Math.random() * 0.6 + 0.2}"/>`;
    }

    // 生成贝塞尔曲线干扰 (2-3条)
    const curveCount = Math.floor(Math.random() * 2) + 2;
    let curves = '';
    for (let i = 0; i < curveCount; i++) {
      const x1 = Math.random() * 20;
      const y1 = Math.random() * height;
      const cx1 = Math.random() * width;
      const cy1 = Math.random() * height;
      const cx2 = Math.random() * width;
      const cy2 = Math.random() * height;
      const x2 = width - Math.random() * 20;
      const y2 = Math.random() * height;
      curves += `<path d="M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}" stroke="${lineColor()}" fill="none" stroke-width="${Math.random() + 0.8}" opacity="0.5"/>`;
    }

    // 生成字符（带随机旋转和位移）
    let charElements = '';
    const charWidth = width / (chars.length + 1);
    for (let i = 0; i < chars.length; i++) {
      const x = charWidth * (i + 0.7) + (Math.random() * 10 - 5);
      const y = height * 0.6 + (Math.random() * 10 - 5);
      const rotation = Math.random() * 30 - 15;
      const fontSize = Math.floor(Math.random() * 6) + 22;
      const fontWeight = Math.random() > 0.5 ? 'bold' : 'normal';
      const color = textColor();

      charElements += `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="Arial, Helvetica, sans-serif" fill="${color}" transform="rotate(${rotation} ${x} ${y})">${chars[i]}</text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f5f0e8"/>
  ${lines}
  ${curves}
  ${dots}
  ${charElements}
</svg>`;
  }

  /**
   * IP 限流检查
   */
  private checkRateLimit(ip: string): void {
    const now = Date.now();
    const entry = this.rateLimit.get(ip);

    if (!entry || now - entry.firstRequest > this.RATE_LIMIT_WINDOW) {
      this.rateLimit.set(ip, { count: 1, firstRequest: now });
      return;
    }

    entry.count++;
    if (entry.count > this.RATE_LIMIT_MAX) {
      throw new BadRequestException('请求过于频繁，请稍后再试');
    }
  }

  /**
   * 清理过期验证码和限流记录
   */
  private cleanup(): void {
    const now = Date.now();

    // 清理过期验证码
    for (const [id, entry] of this.store.entries()) {
      if (now - entry.createdAt > this.CAPTCHA_TTL) {
        this.store.delete(id);
      }
    }

    // 清理过期限流记录
    for (const [ip, entry] of this.rateLimit.entries()) {
      if (now - entry.firstRequest > this.RATE_LIMIT_WINDOW) {
        this.rateLimit.delete(ip);
      }
    }
  }
}

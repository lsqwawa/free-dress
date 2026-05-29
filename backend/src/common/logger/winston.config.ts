import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
  const ctx = context ? `[${context}]` : '';
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  const traceStr = trace ? `\n${trace}` : '';
  return `${timestamp} ${level} ${ctx} ${message}${metaStr}${traceStr}`;
});

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    // 控制台输出（开发环境带颜色）
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(
        colorize({ all: process.env.NODE_ENV !== 'production' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
    }),
    // 文件输出（错误级别单独一个文件）
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // 全量日志文件
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat,
      ),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
  ],
});

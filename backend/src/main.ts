import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import { winstonConfig } from './common/logger/winston.config';

/**
 * 应用程序入口
 * 配置并启动 NestJS 应用
 */
async function bootstrap() {
  // 启动前断言关键环境变量
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      console.error(`[FATAL] 环境变量 ${key} 未配置，应用无法启动`);
      process.exit(1);
    }
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.error('[FATAL] JWT_SECRET 长度不足16位，存在安全风险');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

  // 配置全局管道 - 请求验证
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除未定义的属性
      forbidNonWhitelisted: true, // 禁止未定义的属性
      transform: true, // 自动转换类型
    }),
  );

  // 配置全局拦截器 - 统一响应格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置全局过滤器 - 异常处理
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置 CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081', 'http://10.0.2.2:3000'];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // 配置 API 前缀
  app.setGlobalPrefix('api');

  // 配置 Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('畅搭（FreeDress）API')
    .setDescription('智能衣物搭配平台 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 启动服务器
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`=================================`);
  console.log(`🚀 畅搭（FreeDress）服务已启动`);
  console.log(`📡 服务地址: http://localhost:${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/api/docs`);
  console.log(`=================================`);
}

bootstrap();

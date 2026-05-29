"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const winston_config_1 = require("./common/logger/winston.config");
async function bootstrap() {
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
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: winston_config_1.winstonConfig,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081', 'http://10.0.2.2:3000'];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('畅搭（FreeDress）API')
        .setDescription('智能衣物搭配平台 API 文档')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`=================================`);
    console.log(`🚀 畅搭（FreeDress）服务已启动`);
    console.log(`📡 服务地址: http://localhost:${port}`);
    console.log(`📚 API 文档: http://localhost:${port}/api/docs`);
    console.log(`=================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map
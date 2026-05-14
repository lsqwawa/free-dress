"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.enableCors({
        origin: true,
        credentials: true,
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
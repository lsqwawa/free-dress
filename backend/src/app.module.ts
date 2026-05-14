import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClothesModule } from './modules/clothes/clothes.module';

/**
 * 应用根模块
 * 整合所有功能模块
 */
@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Prisma 数据库模块
    PrismaModule,
    // 认证模块
    AuthModule,
    // 用户模块
    UsersModule,
    // 衣物模块
    ClothesModule,
  ],
})
export class AppModule {}

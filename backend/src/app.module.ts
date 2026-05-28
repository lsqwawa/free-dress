import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClothesModule } from './modules/clothes/clothes.module';
import { UploadModule } from './modules/upload/upload.module';
import { OutfitsModule } from './modules/outfits/outfits.module';
import { TryonModule } from './modules/tryon/tryon.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClothesModule,
    UploadModule,
    OutfitsModule,
    TryonModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { ClothesController } from './clothes.controller';

/**
 * 衣物模块
 * 提供衣物管理相关功能
 */
@Module({
  controllers: [ClothesController],
  providers: [ClothesService],
  exports: [ClothesService],
})
export class ClothesModule {}

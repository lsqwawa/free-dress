import { IsString, IsOptional, IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOutfitDto {
  @ApiProperty({ description: '衣物ID列表', example: ['cloth-id-1', 'cloth-id-2'] })
  @IsArray()
  @ArrayMinSize(1, { message: '至少选择一件衣物' })
  @IsString({ each: true })
  clothIds: string[];

  @ApiPropertyOptional({ description: '风格', example: '简约' })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional({ description: '场合', example: '通勤' })
  @IsOptional()
  @IsString()
  occasion?: string;

  @ApiPropertyOptional({ description: 'AI 生成的搭配描述' })
  @IsOptional()
  @IsString()
  aiDescription?: string;

  @ApiPropertyOptional({ description: '搭配效果图 URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

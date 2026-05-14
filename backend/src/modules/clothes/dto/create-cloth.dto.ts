import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClothCategory } from '@prisma/client';

/**
 * 创建衣物请求 DTO
 */
export class CreateClothDto {
  @ApiProperty({ description: '衣物图片URL', example: 'https://example.com/cloth.jpg' })
  @IsString({ message: '图片URL必须是字符串' })
  @IsNotEmpty({ message: '图片URL不能为空' })
  imageUrl: string;

  @ApiProperty({ 
    description: '衣物分类', 
    enum: ClothCategory,
    example: 'TOP' 
  })
  @IsEnum(ClothCategory, { message: '无效的衣物分类' })
  @IsNotEmpty({ message: '分类不能为空' })
  category: ClothCategory;

  @ApiProperty({ description: '颜色', example: '黑色', required: false })
  @IsString({ message: '颜色必须是字符串' })
  @IsOptional()
  color?: string;

  @ApiProperty({ description: '风格', example: '休闲', required: false })
  @IsString({ message: '风格必须是字符串' })
  @IsOptional()
  style?: string;

  @ApiProperty({ description: '适用季节', example: ['春', '夏'], required: false, type: [String] })
  @IsArray({ message: '季节必须是数组' })
  @IsOptional()
  season?: string[];

  @ApiProperty({ description: '标签', example: ['T恤', '纯棉'], required: false, type: [String] })
  @IsArray({ message: '标签必须是数组' })
  @IsOptional()
  tags?: string[];
}

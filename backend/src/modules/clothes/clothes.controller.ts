import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClothesService } from './clothes.service';
import { CreateClothDto } from './dto/create-cloth.dto';
import { UpdateClothDto } from './dto/update-cloth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClothCategory } from '@prisma/client';

/**
 * 衣物控制器
 * 处理衣物相关接口
 */
@ApiTags('衣物')
@Controller('clothes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClothesController {
  constructor(private readonly clothesService: ClothesService) {}

  /**
   * 创建衣物
   */
  @Post()
  @ApiOperation({ summary: '创建衣物', description: '上传一件新衣物到衣橱' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createClothDto: CreateClothDto,
  ) {
    return this.clothesService.create(userId, createClothDto);
  }

  /**
   * 获取衣物列表
   */
  @Get()
  @ApiOperation({ summary: '获取衣物列表', description: '获取当前用户的所有衣物' })
  @ApiQuery({ name: 'category', enum: ClothCategory, required: false, description: '按分类筛选' })
  async findAll(
    @CurrentUser('userId') userId: string,
    @Query('category') category?: ClothCategory,
  ) {
    return this.clothesService.findAll(userId, category);
  }

  /**
   * 获取衣物详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取衣物详情', description: '获取指定衣物的详细信息' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.clothesService.findOne(id, userId);
  }

  /**
   * 更新衣物
   */
  @Put(':id')
  @ApiOperation({ summary: '更新衣物', description: '更新指定衣物的信息' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateClothDto: UpdateClothDto,
  ) {
    return this.clothesService.update(id, userId, updateClothDto);
  }

  /**
   * 删除衣物
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除衣物', description: '删除指定的衣物' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.clothesService.remove(id, userId);
  }

  /**
   * 获取分类统计
   */
  @Get('stats/categories')
  @ApiOperation({ summary: '获取分类统计', description: '获取各分类的衣物数量统计' })
  async getCategoryStats(@CurrentUser('userId') userId: string) {
    return this.clothesService.getCategoryStats(userId);
  }
}

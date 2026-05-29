import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OutfitsService } from './outfits.service';
import { RecommendationService } from './recommendation.service';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('搭配')
@Controller('outfits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OutfitsController {
  constructor(
    private readonly outfitsService: OutfitsService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建搭配' })
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateOutfitDto,
  ) {
    return this.outfitsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取搭配列表' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.outfitsService.findAll(userId);
  }

  @Get('favorites')
  @ApiOperation({ summary: '获取收藏列表' })
  getFavorites(@CurrentUser('userId') userId: string) {
    return this.outfitsService.getFavorites(userId);
  }

  @Get('recommendations')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'AI智能搭配推荐' })
  @ApiQuery({ name: 'scene', required: false, description: '场景（如：日常、约会、职场）' })
  @ApiQuery({ name: 'season', required: false, description: '季节（春/夏/秋/冬）' })
  @ApiQuery({ name: 'count', required: false, description: '推荐数量（默认3）' })
  getRecommendations(
    @CurrentUser('userId') userId: string,
    @Query('scene') scene?: string,
    @Query('season') season?: string,
    @Query('count') count?: string,
  ) {
    const parsedCount = Math.min(Math.max(parseInt(count, 10) || 3, 1), 5);
    return this.recommendationService.getRecommendations(userId, {
      scene,
      season,
      count: parsedCount,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取搭配详情' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.outfitsService.findOne(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除搭配' })
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.outfitsService.remove(id, userId);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: '收藏/取消收藏搭配' })
  toggleFavorite(
    @Param('id') outfitId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.outfitsService.toggleFavorite(userId, outfitId);
  }
}

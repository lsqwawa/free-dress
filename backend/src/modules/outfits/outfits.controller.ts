import {
  Controller, Get, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutfitsService } from './outfits.service';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('搭配')
@Controller('outfits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OutfitsController {
  constructor(private readonly outfitsService: OutfitsService) {}

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

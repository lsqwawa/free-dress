import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TryonService } from './tryon.service';
import { CreateTryonDto } from './dto/create-tryon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AiQuotaService } from './ai-quota.service';

@ApiTags('AI 试穿')
@Controller('tryon')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TryonController {
  constructor(
    private readonly tryonService: TryonService,
    private readonly quotaService: AiQuotaService,
  ) {}

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: '提交试穿请求' })
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTryonDto,
  ) {
    return this.tryonService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取试穿记录列表' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.tryonService.findAll(userId);
  }

  @Get('quota')
  @ApiOperation({ summary: '获取今日AI使用概况（试穿+推荐）' })
  async getQuota(@CurrentUser('userId') userId: string) {
    return this.quotaService.getDailyUsageSummary(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单条试穿记录' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.tryonService.findOne(id, userId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: '查询试穿任务状态（前端轮询）' })
  getStatus(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.tryonService.getStatus(id, userId);
  }
}

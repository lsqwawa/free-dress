import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TryonService } from './tryon.service';
import { CreateTryonDto } from './dto/create-tryon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI 试穿')
@Controller('tryon')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TryonController {
  constructor(private readonly tryonService: TryonService) {}

  @Post()
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

  @Get(':id')
  @ApiOperation({ summary: '获取单条试穿记录' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.tryonService.findOne(id, userId);
  }
}

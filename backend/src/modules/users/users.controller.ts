import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 用户控制器
 * 处理用户相关接口
 */
@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @ApiOperation({ summary: '获取用户信息', description: '获取当前登录用户的详细信息' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  /**
   * 更新用户资料
   */
  @Put('profile')
  @ApiOperation({ summary: '更新用户资料', description: '更新当前用户的昵称和头像' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  /**
   * 获取用户统计数据
   */
  @Get('stats')
  @ApiOperation({ summary: '获取用户统计', description: '获取用户的衣物、搭配等统计数据' })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.usersService.getUserStats(userId);
  }
}

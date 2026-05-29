import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

/**
 * 管理后台控制器
 * 所有接口都需要 JWT 认证 + ADMIN 角色
 */
@ApiTags('管理后台')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 系统总览统计
   */
  @Get('stats')
  @ApiOperation({ summary: '系统总览统计' })
  getStats() {
    return this.adminService.getStats();
  }

  /**
   * 用户列表（分页+筛选）
   */
  @Get('users')
  @ApiOperation({ summary: '用户列表' })
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('registerSource') registerSource?: string,
  ) {
    return this.adminService.getUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      role,
      registerSource,
    });
  }

  /**
   * 用户详情
   */
  @Get('users/:id')
  @ApiOperation({ summary: '用户详情' })
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  /**
   * 修改用户角色
   */
  @Put('users/:id/role')
  @ApiOperation({ summary: '修改用户角色' })
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  /**
   * 衣物列表
   */
  @Get('clothes')
  @ApiOperation({ summary: '衣物列表' })
  getClothes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getClothes({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      category,
      userId,
    });
  }

  /**
   * 搭配列表
   */
  @Get('outfits')
  @ApiOperation({ summary: '搭配列表' })
  getOutfits(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getOutfits({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      userId,
    });
  }

  /**
   * 试穿任务列表
   */
  @Get('tryon')
  @ApiOperation({ summary: '试穿任务列表' })
  getTryonList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getTryonList({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
    });
  }

  /**
   * 试穿统计
   */
  @Get('tryon/stats')
  @ApiOperation({ summary: '试穿统计' })
  getTryonStats() {
    return this.adminService.getTryonStats();
  }

  /**
   * 订阅列表
   */
  @Get('subscriptions')
  @ApiOperation({ summary: '订阅列表' })
  getSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSubscriptions({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
    });
  }

  /**
   * AI 配额统计
   */
  @Get('ai-quotas/stats')
  @ApiOperation({ summary: 'AI 配额统计' })
  getAiQuotaStats() {
    return this.adminService.getAiQuotaStats();
  }
}

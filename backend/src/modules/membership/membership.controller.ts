import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('会员')
@Controller('membership')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get()
  @ApiOperation({ summary: '获取会员信息' })
  getMembershipInfo(@CurrentUser('userId') userId: string) {
    return this.membershipService.getMembershipInfo(userId);
  }

  @Get('plans')
  @ApiOperation({ summary: '获取套餐列表' })
  getPlans() {
    return this.membershipService.getPlans();
  }

  @Post('subscribe')
  @ApiOperation({ summary: '开通会员（简化版，实际需对接支付）' })
  subscribe(
    @CurrentUser('userId') userId: string,
    @Body() body: { plan: 'MONTHLY' | 'YEARLY' },
  ) {
    return this.membershipService.subscribe(userId, body.plan);
  }
}

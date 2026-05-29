import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MembershipInfo {
  isVip: boolean;
  plan: string | null;
  expiresAt: string | null;
  daysRemaining: number;
  benefits: string[];
}

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户会员信息
   */
  async getMembershipInfo(userId: string): Promise<MembershipInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // 查找有效订阅
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
      orderBy: { endDate: 'desc' },
    });

    const isVip = user?.role === 'VIP' && !!subscription;
    const daysRemaining = subscription
      ? Math.max(0, Math.ceil((subscription.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : 0;

    return {
      isVip,
      plan: subscription?.plan || null,
      expiresAt: subscription?.endDate?.toISOString() || null,
      daysRemaining,
      benefits: isVip
        ? ['AI试穿 15次/天', 'AI推荐 100次/天', '无限衣橱', '优先生成']
        : ['AI试穿 3次/天', 'AI推荐 10次/天', '衣橱50件上限'],
    };
  }

  /**
   * 获取可用套餐列表
   */
  getPlans() {
    return [
      {
        id: 'MONTHLY',
        name: 'VIP月卡',
        price: 19.9,
        originalPrice: 29.9,
        duration: '30天',
        benefits: ['AI试穿 15次/天', 'AI推荐 100次/天', '无限衣橱', '优先生成'],
        tag: '推荐',
      },
      {
        id: 'YEARLY',
        name: 'SVIP年卡',
        price: 168,
        originalPrice: 238.8,
        duration: '365天',
        benefits: ['月卡全部权益', '专属搭配报告', '天气联动推荐', '优先客服'],
        tag: '最划算',
      },
    ];
  }

  /**
   * 开通/续费会员（简化实现，实际需对接支付）
   */
  async subscribe(userId: string, plan: 'MONTHLY' | 'YEARLY'): Promise<{ message: string }> {
    const duration = plan === 'MONTHLY' ? 30 : 365;
    const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    // 创建订阅记录
    await this.prisma.subscription.create({
      data: {
        userId,
        plan,
        endDate,
        status: 'ACTIVE',
      },
    });

    // 更新用户角色
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'VIP' },
    });

    this.logger.log(`用户 ${userId} 开通 ${plan} 会员，到期 ${endDate.toISOString()}`);

    return { message: `${plan === 'MONTHLY' ? '月卡' : '年卡'}开通成功` };
  }
}

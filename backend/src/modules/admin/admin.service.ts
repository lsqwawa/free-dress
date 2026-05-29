import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ClothCategory,
  Prisma,
  RegisterSource,
  SubscriptionStatus,
  TryOnStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface PageQuery {
  page: number;
  limit: number;
}

interface UsersQuery extends PageQuery {
  search?: string;
  role?: string;
  registerSource?: string;
}

interface ClothesQuery extends PageQuery {
  category?: string;
  userId?: string;
}

interface OutfitsQuery extends PageQuery {
  userId?: string;
}

interface TryonQuery extends PageQuery {
  status?: string;
}

interface SubscriptionsQuery extends PageQuery {
  status?: string;
}

/**
 * 管理后台服务
 * 提供 Admin 端的统计、用户管理、内容管理等业务逻辑
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 系统总览统计
   */
  async getStats() {
    // 今日 0 点
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todayNewUsers,
      vipUsers,
      totalClothes,
      totalOutfits,
      totalTryons,
      pendingTryons,
      failedTryons,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { role: 'VIP' } }),
      this.prisma.cloth.count(),
      this.prisma.outfit.count(),
      this.prisma.tryOnResult.count(),
      this.prisma.tryOnResult.count({
        where: { status: { in: ['PENDING', 'PROCESSING'] } },
      }),
      this.prisma.tryOnResult.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      totalUsers,
      todayNewUsers,
      vipUsers,
      totalClothes,
      totalOutfits,
      totalTryons,
      pendingTryons,
      failedTryons,
    };
  }

  /**
   * 用户列表（分页+筛选）
   */
  async getUsers(query: UsersQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.role && this.isValidUserRole(query.role)) {
      where.role = query.role as UserRole;
    }
    if (query.registerSource && this.isValidRegisterSource(query.registerSource)) {
      where.registerSource = query.registerSource as RegisterSource;
    }
    if (query.search) {
      const keyword = query.search.trim();
      if (keyword) {
        where.OR = [
          { phone: { contains: keyword, mode: 'insensitive' } },
          { nickname: { contains: keyword, mode: 'insensitive' } },
          { wechatNickname: { contains: keyword, mode: 'insensitive' } },
        ];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatarUrl: true,
          role: true,
          registerSource: true,
          wechatNickname: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * 用户详情（含关联数据计数）
   */
  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        registerSource: true,
        wechatUnionId: true,
        wechatOpenIdApp: true,
        wechatOpenIdMp: true,
        wechatNickname: true,
        wechatAvatarUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clothes: true,
            outfits: true,
            tryOnResults: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 修改用户角色
   */
  async updateUserRole(id: string, role: UserRole) {
    if (!this.isValidUserRole(role)) {
      throw new BadRequestException('非法的角色值');
    }
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('用户不存在');
    }
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        phone: true,
        nickname: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 衣物列表
   */
  async getClothes(query: ClothesQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ClothWhereInput = {};
    if (query.category && this.isValidClothCategory(query.category)) {
      where.category = query.category as ClothCategory;
    }
    if (query.userId) {
      where.userId = query.userId;
    }

    const [data, total] = await Promise.all([
      this.prisma.cloth.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, phone: true, nickname: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.cloth.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * 搭配列表
   */
  async getOutfits(query: OutfitsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OutfitWhereInput = {};
    if (query.userId) {
      where.userId = query.userId;
    }

    const [data, total] = await Promise.all([
      this.prisma.outfit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, phone: true, nickname: true, avatarUrl: true },
          },
          outfitClothes: {
            include: { cloth: true },
            orderBy: { order: 'asc' },
          },
        },
      }),
      this.prisma.outfit.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * 试穿任务列表
   */
  async getTryonList(query: TryonQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.TryOnResultWhereInput = {};
    if (query.status && this.isValidTryOnStatus(query.status)) {
      where.status = query.status as TryOnStatus;
    }

    const [data, total] = await Promise.all([
      this.prisma.tryOnResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, phone: true, nickname: true, avatarUrl: true },
          },
          outfit: {
            select: { id: true, style: true, occasion: true, imageUrl: true },
          },
        },
      }),
      this.prisma.tryOnResult.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * 试穿统计：各状态数量 + 平均处理时间 + 失败原因 Top5
   */
  async getTryonStats() {
    const statusGroups = await this.prisma.tryOnResult.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const statusCounts: Record<TryOnStatus, number> = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
    };
    statusGroups.forEach((g) => {
      statusCounts[g.status] = g._count._all;
    });

    // 平均处理时间（仅统计已完成且有耗时的记录）
    const avgAgg = await this.prisma.tryOnResult.aggregate({
      _avg: { processingTime: true },
      where: { status: 'COMPLETED', processingTime: { not: null } },
    });

    // 失败原因 Top5
    const failReasonGroups = await this.prisma.tryOnResult.groupBy({
      by: ['failReason'],
      where: { status: 'FAILED', failReason: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { failReason: 'desc' } },
      take: 5,
    });

    return {
      statusCounts,
      avgProcessingTime: avgAgg._avg.processingTime ?? 0,
      topFailReasons: failReasonGroups.map((g) => ({
        reason: g.failReason,
        count: g._count._all,
      })),
    };
  }

  /**
   * 订阅列表
   */
  async getSubscriptions(query: SubscriptionsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {};
    if (query.status && this.isValidSubscriptionStatus(query.status)) {
      where.status = query.status as SubscriptionStatus;
    }

    const [rows, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    // 关联用户信息（subscription 没有外键关系定义，手动 join）
    const userIds = Array.from(new Set(rows.map((r) => r.userId)));
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, phone: true, nickname: true, avatarUrl: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const data = rows.map((r) => ({
      ...r,
      user: userMap.get(r.userId) || null,
    }));

    return { data, total, page, limit };
  }

  /**
   * AI 配额统计：近 7 天 / 30 天的 AI 使用统计
   */
  async getAiQuotaStats() {
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date7 = new Date(today);
    date7.setDate(date7.getDate() - 6); // 近 7 天含今天
    const date30 = new Date(today);
    date30.setDate(date30.getDate() - 29); // 近 30 天含今天

    const since7 = formatDate(date7);
    const since30 = formatDate(date30);

    // 近 30 天按日期+类型分组
    const last30Records = await this.prisma.aiQuota.findMany({
      where: { date: { gte: since30 } },
      select: { date: true, type: true, count: true, userId: true },
    });

    // 聚合
    const dailyMap30 = new Map<string, { tryon: number; recommend: number; total: number }>();
    const dailyMap7 = new Map<string, { tryon: number; recommend: number; total: number }>();
    let total7 = 0;
    let total30 = 0;
    let tryon7 = 0;
    let tryon30 = 0;
    let recommend7 = 0;
    let recommend30 = 0;
    const users7 = new Set<string>();
    const users30 = new Set<string>();

    for (const r of last30Records) {
      const bucket30 = dailyMap30.get(r.date) || { tryon: 0, recommend: 0, total: 0 };
      if (r.type === 'tryon') bucket30.tryon += r.count;
      else if (r.type === 'recommend') bucket30.recommend += r.count;
      bucket30.total += r.count;
      dailyMap30.set(r.date, bucket30);

      total30 += r.count;
      if (r.type === 'tryon') tryon30 += r.count;
      if (r.type === 'recommend') recommend30 += r.count;
      users30.add(r.userId);

      if (r.date >= since7) {
        const bucket7 = dailyMap7.get(r.date) || { tryon: 0, recommend: 0, total: 0 };
        if (r.type === 'tryon') bucket7.tryon += r.count;
        else if (r.type === 'recommend') bucket7.recommend += r.count;
        bucket7.total += r.count;
        dailyMap7.set(r.date, bucket7);

        total7 += r.count;
        if (r.type === 'tryon') tryon7 += r.count;
        if (r.type === 'recommend') recommend7 += r.count;
        users7.add(r.userId);
      }
    }

    const buildSeries = (
      from: Date,
      days: number,
      map: Map<string, { tryon: number; recommend: number; total: number }>,
    ) => {
      const series: Array<{ date: string; tryon: number; recommend: number; total: number }> = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(from);
        d.setDate(d.getDate() + i);
        const key = formatDate(d);
        const v = map.get(key) || { tryon: 0, recommend: 0, total: 0 };
        series.push({ date: key, ...v });
      }
      return series;
    };

    return {
      last7Days: {
        total: total7,
        tryon: tryon7,
        recommend: recommend7,
        activeUsers: users7.size,
        series: buildSeries(date7, 7, dailyMap7),
      },
      last30Days: {
        total: total30,
        tryon: tryon30,
        recommend: recommend30,
        activeUsers: users30.size,
        series: buildSeries(date30, 30, dailyMap30),
      },
    };
  }

  // ==================== 枚举校验 ====================

  private isValidUserRole(value: string): boolean {
    return Object.values(UserRole).includes(value as UserRole);
  }

  private isValidRegisterSource(value: string): boolean {
    return Object.values(RegisterSource).includes(value as RegisterSource);
  }

  private isValidClothCategory(value: string): boolean {
    return Object.values(ClothCategory).includes(value as ClothCategory);
  }

  private isValidTryOnStatus(value: string): boolean {
    return Object.values(TryOnStatus).includes(value as TryOnStatus);
  }

  private isValidSubscriptionStatus(value: string): boolean {
    return Object.values(SubscriptionStatus).includes(value as SubscriptionStatus);
  }
}

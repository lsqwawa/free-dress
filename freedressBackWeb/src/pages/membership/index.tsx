import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Crown,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import {
  Card,
  CardContent,
  Badge,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Skeleton,
  Pagination,
} from '@/components/ui';
import { formatDateTime, formatDate, formatNumber, formatCurrency } from '@/utils';

const STATUS_TABS = [
  { label: '全部', value: '' },
  { label: '活跃', value: 'ACTIVE' },
  { label: '已过期', value: 'EXPIRED' },
  { label: '已取消', value: 'CANCELLED' },
];

const STATUS_CONFIG: Record<string, { label: string; tone: 'success' | 'neutral' | 'danger' }> = {
  ACTIVE: { label: '活跃', tone: 'success' },
  EXPIRED: { label: '已过期', tone: 'neutral' },
  CANCELLED: { label: '已取消', tone: 'danger' },
};

const PLAN_CONFIG: Record<string, { label: string; tone: 'gold' | 'neutral' }> = {
  MONTHLY: { label: '月卡', tone: 'neutral' },
  YEARLY: { label: '年卡', tone: 'gold' },
};

const MONTHLY_PRICE = 19.9;
const YEARLY_PRICE = 168;

export default function MembershipPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 15;

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', { page, pageSize, status: statusFilter }],
    queryFn: () =>
      adminApi.listSubscriptions({
        page,
        pageSize,
        status: statusFilter || undefined,
      }),
  });

  // Fetch all active subs for stats (page 1 with large limit for counting)
  const { data: activeData } = useQuery({
    queryKey: ['admin', 'subscriptions-active'],
    queryFn: () => adminApi.listSubscriptions({ page: 1, pageSize: 200, status: 'ACTIVE' }),
  });

  // Compute stats from active subscriptions
  const stats = useMemo(() => {
    const list = activeData?.list ?? [];
    const monthly = list.filter((s) => s.plan === 'MONTHLY').length;
    const yearly = list.filter((s) => s.plan === 'YEARLY').length;
    const totalActive = list.length;
    const monthlyRevenue = monthly * MONTHLY_PRICE + yearly * (YEARLY_PRICE / 12);

    return { totalActive, monthly, yearly, monthlyRevenue };
  }, [activeData]);

  // Expiring soon (within 7 days)
  const expiringSoon = useMemo(() => {
    if (!activeData?.list) return [];
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return activeData.list.filter((s) => {
      const end = new Date(s.endDate);
      return end >= now && end <= sevenDays;
    });
  }, [activeData]);

  // Pie chart data
  const pieData = useMemo(
    () => [
      { name: '月卡', value: stats.monthly, fill: '#8A8A8A' },
      { name: '年卡', value: stats.yearly, fill: '#D4AF37' },
    ],
    [stats],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl text-ivory tracking-tight">会员管理</h1>
        <p className="mt-1 text-sm text-ash">月卡 / 年卡订阅、续费与生效状态管理</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="活跃会员"
          value={formatNumber(stats.totalActive)}
          icon={<Users className="h-5 w-5 text-success" />}
        />
        <StatCard
          label="月卡会员"
          value={formatNumber(stats.monthly)}
          icon={<CreditCard className="h-5 w-5 text-ash" />}
        />
        <StatCard
          label="年卡会员"
          value={formatNumber(stats.yearly)}
          icon={<Crown className="h-5 w-5 text-gold-400" />}
        />
        <StatCard
          label="本月收入估算"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<TrendingUp className="h-5 w-5 text-gold-400" />}
          highlight
        />
      </div>

      {/* Chart + Expiring */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Pie Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-ash mb-4">套餐占比</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A22',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <Legend color="#8A8A8A" label="月卡" value={stats.monthly} />
              <Legend color="#D4AF37" label="年卡" value={stats.yearly} />
            </div>
          </CardContent>
        </Card>

        {/* Expiring Warning */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-ash mb-4">
              <AlertTriangle className="mr-1 inline h-3 w-3 text-warning" />
              即将到期预警（7天内）
            </p>
            {expiringSoon.length === 0 ? (
              <div className="py-10 text-center text-ash text-sm">
                暂无即将到期的订阅
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {expiringSoon.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-4 w-4 text-warning" />
                      <span className="text-sm text-ivory">
                        {sub.user?.nickname || sub.user?.phone || '未知'}
                      </span>
                      <Badge tone={PLAN_CONFIG[sub.plan]?.tone ?? 'neutral'}>
                        {PLAN_CONFIG[sub.plan]?.label ?? sub.plan}
                      </Badge>
                    </div>
                    <span className="text-xs text-warning">
                      到期: {formatDate(sub.endDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-gold/10 pb-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              statusFilter === tab.value
                ? 'border-gold text-gold'
                : 'border-transparent text-ash hover:text-ivory'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscription Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : !listData?.list?.length ? (
        <Card className="py-16 text-center">
          <Crown className="mx-auto h-10 w-10 text-ash/40" />
          <p className="mt-3 text-ash">暂无订阅数据</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>用户</TH>
                <TH>套餐类型</TH>
                <TH>状态</TH>
                <TH>开始日期</TH>
                <TH>结束日期</TH>
                <TH>创建时间</TH>
              </TR>
            </THead>
            <TBody>
              {listData.list.map((sub) => {
                const planCfg = PLAN_CONFIG[sub.plan] ?? { label: sub.plan, tone: 'neutral' as const };
                const statusCfg = STATUS_CONFIG[sub.status] ?? { label: sub.status, tone: 'neutral' as const };
                return (
                  <TR key={sub.id}>
                    <TD>
                      <span className="flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 text-ash" />
                        <span className="text-sm text-ivory">
                          {sub.user?.nickname || sub.user?.phone || '-'}
                        </span>
                      </span>
                    </TD>
                    <TD>
                      <Badge tone={planCfg.tone}>{planCfg.label}</Badge>
                    </TD>
                    <TD>
                      <Badge tone={statusCfg.tone}>{statusCfg.label}</Badge>
                    </TD>
                    <TD className="text-xs text-ash">{formatDate(sub.startDate)}</TD>
                    <TD className="text-xs text-ash">{formatDate(sub.endDate)}</TD>
                    <TD className="text-xs text-ash">{formatDateTime(sub.createdAt)}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {listData && listData.total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={listData.total}
          onChange={setPage}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-lg bg-white/[0.03] p-2.5">{icon}</div>
        <div>
          <p className="text-xs text-ash uppercase tracking-wider">{label}</p>
          <p
            className={`text-2xl font-display ${highlight ? 'text-gold-400' : 'text-ivory'}`}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-ash">
        {label}: <span className="text-ivory">{value}</span>
      </span>
    </div>
  );
}

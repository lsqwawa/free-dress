import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Crown,
  Shirt,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { adminApi } from '@/api/admin';
import { Skeleton } from '@/components/ui';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui';
import { Badge } from '@/components/ui';
import { formatDateTime, formatNumber } from '@/utils';

// ==================== 统计卡片组件 ====================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="glass-panel rounded-xl border-l-2 border-l-gold/60 p-5 hover:border-gold/20 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ash">{label}</p>
          <p className="mt-2 text-3xl font-display text-gold-400">{formatNumber(Number(value))}</p>
          {sub && <p className="mt-1 text-xs text-ash">{sub}</p>}
        </div>
        <div className="rounded-lg bg-gold/10 p-2.5">
          <Icon className="h-5 w-5 text-gold" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="glass-panel rounded-xl border-l-2 border-l-gold/20 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

// ==================== Mock 衣物上传趋势数据 ====================

function generateMockTrendData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      value: Math.floor(Math.random() * 40) + 10,
    });
  }
  return data;
}

// ==================== 饼图颜色 ====================

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#D4AF37',
  PROCESSING: '#5BC0DE',
  PENDING: '#8A8A8A',
  FAILED: '#D9534F',
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: '已完成',
  PROCESSING: '处理中',
  PENDING: '待处理',
  FAILED: '失败',
};

// ==================== Dashboard 页面 ====================

export default function DashboardPage() {
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  // 获取仪表盘统计数据
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  });

  // 获取试穿统计
  const { data: tryOnStats, isLoading: tryOnLoading } = useQuery({
    queryKey: ['admin', 'tryon-stats'],
    queryFn: adminApi.tryOnStats,
  });

  // 获取 AI 配额统计
  const { data: aiQuotaStats, isLoading: aiQuotaLoading } = useQuery({
    queryKey: ['admin', 'ai-quota-stats'],
    queryFn: () => adminApi.aiQuotaStats(7),
  });

  // 获取最近注册用户
  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', 'recent'],
    queryFn: () => adminApi.listUsers({ page: 1, pageSize: 5 }),
  });

  // Mock 趋势数据
  const trendData = generateMockTrendData(trendDays);

  // 饼图数据
  const pieData = tryOnStats
    ? Object.entries(tryOnStats.statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        status,
      }))
    : [];

  const totalTryOns = pieData.reduce((acc, item) => acc + item.value, 0);

  // AI 配额柱状图数据：后端返回 { last7Days: { series: [...] }, last30Days: { series: [...] } }
  const barData = (aiQuotaStats?.last7Days.series ?? []).map((item) => ({
    date: item.date,
    calls: item.total,
  }));

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="font-display text-3xl text-ivory tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-ash">数据总览与运营指标</p>
      </div>

      {/* 统计指标卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              icon={Users}
              label="总用户数"
              value={stats.totalUsers}
              sub="total"
            />
            <StatCard
              icon={UserPlus}
              label="今日新增"
              value={stats.newUsersToday}
              sub="较昨日注册"
            />
            <StatCard
              icon={Crown}
              label="VIP 用户"
              value={stats.activeSubscriptions}
              sub={stats.totalUsers > 0 ? `占比 ${((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%` : '-'}
            />
            <StatCard
              icon={Shirt}
              label="总衣物数"
              value={stats.totalClothes}
            />
          </>
        ) : null}
      </div>

      {/* 图表区：衣物上传趋势 + AI 试穿状态 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 衣物上传趋势折线图 */}
        <div className="glass-panel rounded-xl p-6 hover:border-gold/20 transition-all">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg text-ivory">衣物上传趋势</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setTrendDays(7)}
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
                  trendDays === 7
                    ? 'bg-gold/20 text-gold'
                    : 'text-ash hover:text-ivory hover:bg-white/5'
                }`}
              >
                7日
              </button>
              <button
                onClick={() => setTrendDays(30)}
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
                  trendDays === 30
                    ? 'bg-gold/20 text-gold'
                    : 'text-ash hover:text-ivory hover:bg-white/5'
                }`}
              >
                30日
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis dataKey="date" stroke="#8A8A8A" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8A8A8A" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0F',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: 8,
                    color: '#F5F5F0',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={{ fill: '#D4AF37', r: 3 }}
                  activeDot={{ r: 5, fill: '#F5E9C0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI 试穿状态分布饼图 */}
        <div className="glass-panel rounded-xl p-6 hover:border-gold/20 transition-all">
          <h3 className="mb-4 font-display text-lg text-ivory">AI 试穿状态分布</h3>
          {tryOnLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          ) : (
            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] || '#8A8A8A'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0F',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 8,
                      color: '#F5F5F0',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 中心数字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-display text-gold-400">{formatNumber(totalTryOns)}</span>
                <span className="text-[10px] uppercase tracking-widest text-ash">总次数</span>
              </div>
            </div>
          )}
          {/* 图例 */}
          <div className="mt-2 flex flex-wrap gap-3 justify-center">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-ash">{STATUS_LABELS[status]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 配额使用统计 */}
      <div className="glass-panel rounded-xl p-6 hover:border-gold/20 transition-all">
        <h3 className="mb-4 font-display text-lg text-ivory">AI 配额使用统计</h3>
        {aiQuotaLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis dataKey="date" stroke="#8A8A8A" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8A8A8A" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0F',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: 8,
                    color: '#F5F5F0',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="calls" name="AI调用" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 最近注册用户 */}
      <div className="glass-panel rounded-xl hover:border-gold/20 transition-all overflow-hidden">
        <div className="border-b border-gold/10 px-6 py-4">
          <h3 className="font-display text-lg text-ivory">最近注册用户</h3>
        </div>
        {usersLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recentUsers && recentUsers.list.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>用户</TH>
                <TH>手机号</TH>
                <TH>注册来源</TH>
                <TH>注册时间</TH>
              </TR>
            </THead>
            <TBody>
              {recentUsers.list.map((user) => (
                <TR key={user.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-4 w-4 text-gold/60" />
                        )}
                      </div>
                      <span className="text-ivory text-sm">{user.nickname || '-'}</span>
                    </div>
                  </TD>
                  <TD>{user.phone || '-'}</TD>
                  <TD>
                    <RegisterSourceBadge source={user.registerSource} />
                  </TD>
                  <TD>{formatDateTime(user.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-ash">
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 注册来源 Badge ====================

function RegisterSourceBadge({ source }: { source: string }) {
  const map: Record<string, { label: string; tone: 'gold' | 'info' | 'neutral' }> = {
    PHONE: { label: '手机', tone: 'neutral' },
    WECHAT_APP: { label: '微信App', tone: 'info' },
    WECHAT_MP: { label: '小程序', tone: 'gold' },
  };
  const info = map[source] || { label: source, tone: 'neutral' as const };
  return <Badge tone={info.tone}>{info.label}</Badge>;
}

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User as UserIcon,
  Image as ImageIcon,
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
import { formatDateTime, formatNumber } from '@/utils';

const STATUS_TABS: { label: string; value: string }[] = [
  { label: '全部', value: '' },
  { label: '排队中', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '失败', value: 'FAILED' },
];

const STATUS_CONFIG: Record<string, { label: string; tone: 'neutral' | 'info' | 'gold' | 'danger'; pulse?: boolean }> = {
  PENDING: { label: '排队中', tone: 'neutral' },
  PROCESSING: { label: '处理中', tone: 'info', pulse: true },
  COMPLETED: { label: '已完成', tone: 'gold' },
  FAILED: { label: '失败', tone: 'danger' },
};

// Mock: 最近7天任务状态趋势数据
function generateTrendData() {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      COMPLETED: Math.floor(Math.random() * 40) + 20,
      PROCESSING: Math.floor(Math.random() * 10) + 2,
      PENDING: Math.floor(Math.random() * 8) + 1,
      FAILED: Math.floor(Math.random() * 5),
    });
  }
  return data;
}

// Mock: 耗时分布直方图
const DURATION_DISTRIBUTION = [
  { range: '<1s', count: 12 },
  { range: '1-3s', count: 35 },
  { range: '3-5s', count: 28 },
  { range: '5-10s', count: 15 },
  { range: '>10s', count: 5 },
];

export default function TryOnPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 15;

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['admin', 'tryons', { page, pageSize, status: statusFilter }],
    queryFn: () =>
      adminApi.listTryOns({
        page,
        pageSize,
        status: statusFilter || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'tryon-stats'],
    queryFn: () => adminApi.tryOnStats(),
  });

  const trendData = useMemo(() => generateTrendData(), []);

  const totalTasks = stats
    ? stats.statusCounts.PENDING +
      stats.statusCounts.PROCESSING +
      stats.statusCounts.COMPLETED +
      stats.statusCounts.FAILED
    : 0;

  const totalFailed = stats?.topFailReasons?.reduce((sum, r) => sum + r.count, 0) ?? 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl text-ivory tracking-tight">AI 试穿监控</h1>
        <p className="mt-1 text-sm text-ash">试穿任务状态、耗时与失败原因审计</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="总任务数"
          value={totalTasks}
          icon={<Sparkles className="h-5 w-5 text-gold-400" />}
          color="text-gold-400"
        />
        <StatCard
          label="处理中"
          value={stats?.statusCounts.PROCESSING ?? 0}
          icon={<Loader2 className="h-5 w-5 text-info animate-spin" />}
          color="text-info"
          pulse
        />
        <StatCard
          label="已完成"
          value={stats?.statusCounts.COMPLETED ?? 0}
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          color="text-success"
        />
        <StatCard
          label="失败"
          value={stats?.statusCounts.FAILED ?? 0}
          icon={<AlertTriangle className="h-5 w-5 text-danger" />}
          color="text-danger"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Trend Chart */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-ash mb-4">
              任务状态趋势（近7天）
            </p>
            {/* Mock data — 后端暂无此接口 */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                  <XAxis dataKey="date" stroke="#8A8A8A" fontSize={11} />
                  <YAxis stroke="#8A8A8A" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A22',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="COMPLETED"
                    stackId="1"
                    fill="rgba(212,175,55,0.3)"
                    stroke="#D4AF37"
                    name="已完成"
                  />
                  <Area
                    type="monotone"
                    dataKey="PROCESSING"
                    stackId="1"
                    fill="rgba(91,192,222,0.3)"
                    stroke="#5BC0DE"
                    name="处理中"
                  />
                  <Area
                    type="monotone"
                    dataKey="PENDING"
                    stackId="1"
                    fill="rgba(138,138,138,0.2)"
                    stroke="#8A8A8A"
                    name="排队中"
                  />
                  <Area
                    type="monotone"
                    dataKey="FAILED"
                    stackId="1"
                    fill="rgba(217,83,79,0.3)"
                    stroke="#D9534F"
                    name="失败"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Duration Distribution */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-ash mb-1">
              处理耗时分布
            </p>
            <p className="text-[11px] text-ash/60 mb-4">
              平均耗时：
              <span className="text-gold-400 font-medium">
                {stats?.avgProcessingTime ? `${(stats.avgProcessingTime / 1000).toFixed(1)}s` : '-'}
              </span>
            </p>
            {/* Mock data */}
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DURATION_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                  <XAxis dataKey="range" stroke="#8A8A8A" fontSize={11} />
                  <YAxis stroke="#8A8A8A" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A22',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="rgba(212,175,55,0.6)"
                    radius={[4, 4, 0, 0]}
                    name="任务数"
                  />
                  {stats?.avgProcessingTime && (
                    <ReferenceLine
                      y={25}
                      stroke="#D4AF37"
                      strokeDasharray="4 4"
                      label={{
                        value: '平均',
                        fill: '#D4AF37',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fail Reasons */}
      {stats?.topFailReasons && stats.topFailReasons.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-ash mb-4">
              <AlertTriangle className="mr-1 inline h-3 w-3 text-danger" />
              失败原因 Top {stats.topFailReasons.length}
            </p>
            <div className="space-y-3">
              {stats.topFailReasons.map((item, idx) => {
                const pct = Math.round((item.count / totalFailed) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ivory/90">{item.reason}</span>
                      <span className="text-xs text-ash">{item.count} 次 ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-danger/70 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Filter Tabs */}
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

      {/* Task List Table */}
      {listLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : !listData?.list?.length ? (
        <Card className="py-16 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-ash/40" />
          <p className="mt-3 text-ash">暂无试穿任务</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>人物照片</TH>
                <TH>搭配</TH>
                <TH>用户</TH>
                <TH>状态</TH>
                <TH>进度</TH>
                <TH>耗时</TH>
                <TH>创建时间</TH>
              </TR>
            </THead>
            <TBody>
              {listData.list.map((task) => {
                const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <TR key={task.id}>
                    <TD>
                      {task.personImageUrl ? (
                        <img
                          src={task.personImageUrl}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-noir-100">
                          <ImageIcon className="h-4 w-4 text-ash/40" />
                        </div>
                      )}
                    </TD>
                    <TD className="text-xs text-ash">
                      {task.outfit?.style || task.outfitId.slice(0, 8)}
                    </TD>
                    <TD className="text-xs">
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3 text-ash" />
                        {task.user?.nickname ?? '-'}
                      </span>
                    </TD>
                    <TD>
                      <Badge
                        tone={cfg.tone}
                        className={cfg.pulse ? 'animate-pulse' : ''}
                      >
                        {cfg.label}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gold-400 transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-ash">{task.progress}%</span>
                      </div>
                    </TD>
                    <TD className="text-xs text-ash">
                      {task.processingTime
                        ? `${(task.processingTime / 1000).toFixed(1)}s`
                        : '-'}
                    </TD>
                    <TD className="text-xs text-ash">
                      {formatDateTime(task.createdAt)}
                    </TD>
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
  color,
  pulse,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  pulse?: boolean;
}) {
  return (
    <Card className={pulse ? 'border-info/20' : ''}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-lg bg-white/[0.03] p-2.5 ${pulse ? 'animate-pulse' : ''}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-ash uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-display ${color}`}>{formatNumber(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

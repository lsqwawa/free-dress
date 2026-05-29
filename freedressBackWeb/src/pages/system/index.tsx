import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle2,
  Database,
  Gauge,
  Key,
  Layers,
  Link2,
  Lock,
  Server,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Upload as UploadIcon,
  UserCog,
  Users as UsersIcon,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { adminApi } from '@/api/admin';
import {
  Badge,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui';
import { formatDateTime } from '@/utils';

// ==================== 静态配置 ====================

interface RateLimitItem {
  label: string;
  limit: string;
  icon: LucideIcon;
  tone: 'gold' | 'info' | 'warning' | 'success';
}

const RATE_LIMITS: RateLimitItem[] = [
  { label: '全局限流', limit: '100 req / min', icon: Gauge, tone: 'gold' },
  { label: 'AI 试穿', limit: '5 req / min', icon: Zap, tone: 'warning' },
  { label: 'AI 推荐', limit: '10 req / min', icon: Layers, tone: 'info' },
  { label: '文件上传', limit: '20 req / min', icon: UploadIcon, tone: 'success' },
];

interface LogItem {
  id: string;
  type: 'LOGIN' | 'ROLE_CHANGE' | 'DATA_DELETE' | 'CONFIG_UPDATE' | 'AI_CALL';
  desc: string;
  operator: string;
  at: string;
}

const LOG_TYPE_META: Record<
  LogItem['type'],
  { label: string; tone: 'success' | 'gold' | 'danger' | 'info' | 'warning'; icon: LucideIcon }
> = {
  LOGIN: { label: 'LOGIN', tone: 'success', icon: Key },
  ROLE_CHANGE: { label: 'ROLE_CHANGE', tone: 'gold', icon: UserCog },
  DATA_DELETE: { label: 'DATA_DELETE', tone: 'danger', icon: Trash2 },
  CONFIG_UPDATE: { label: 'CONFIG_UPDATE', tone: 'info', icon: ShieldCheck },
  AI_CALL: { label: 'AI_CALL', tone: 'warning', icon: Zap },
};

const MOCK_LOGS: LogItem[] = [
  {
    id: 'log-1',
    type: 'LOGIN',
    desc: '管理员登录后台系统',
    operator: 'admin',
    at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-2',
    type: 'ROLE_CHANGE',
    desc: '将用户 Sophie 角色从 USER 调整为 VIP',
    operator: 'admin',
    at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-3',
    type: 'DATA_DELETE',
    desc: '删除衣物记录 #cl_29f1b2',
    operator: 'admin',
    at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-4',
    type: 'AI_CALL',
    desc: 'AI 试穿任务高峰，触发限流告警',
    operator: 'system',
    at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-5',
    type: 'CONFIG_UPDATE',
    desc: '更新文件上传白名单配置',
    operator: 'admin',
    at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-6',
    type: 'LOGIN',
    desc: '管理员登录后台系统',
    operator: 'admin',
    at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

// ==================== 主页面 ====================

export default function SystemPage() {
  const { data: adminData, isLoading: adminsLoading } = useQuery({
    queryKey: ['admin', 'users', { role: 'ADMIN', page: 1, pageSize: 50 }],
    queryFn: () => adminApi.listUsers({ role: 'ADMIN', page: 1, pageSize: 50 }),
  });

  const apiBase =
    (typeof window !== 'undefined' && window.location.origin + '/api') || '/api';
  const env = import.meta.env.MODE === 'production' ? 'Production' : 'Development';

  return (
    <div className="space-y-8">
      {/* 标题 */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold/80">
          Module · System
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ivory">
          系统设置
        </h1>
        <p className="mt-2 text-sm text-ash">
          运维概览、管理员账号、限流策略与最近活动审计。
        </p>
      </div>

      {/* 系统信息 + 限流卡片 横向布局 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 系统信息 */}
        <SectionCard
          title="System Info"
          subtitle="后端运行状态与连接信息"
          icon={Server}
          className="lg:col-span-2"
        >
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow label="后端版本" value="v1.0.0" icon={Layers} />
            <InfoRow
              label="运行环境"
              value={env}
              icon={Activity}
              valueRight={
                <Badge tone={env === 'Production' ? 'success' : 'warning'}>
                  {env === 'Production' ? 'PROD' : 'DEV'}
                </Badge>
              }
            />
            <InfoRow label="API 基础地址" value={apiBase} icon={Link2} mono />
            <InfoRow
              label="数据库"
              value="PostgreSQL · Prisma"
              icon={Database}
              valueRight={
                <Badge tone="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              }
            />
          </dl>
        </SectionCard>

        {/* 限流配置 */}
        <SectionCard title="Rate Limiting" subtitle="只读 · 来自后端配置" icon={Gauge}>
          <ul className="space-y-3">
            {RATE_LIMITS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-gold/10 bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-gold/20 bg-noir-100 text-gold">
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <span className="text-sm text-ivory">{item.label}</span>
                  </div>
                  <Badge tone={item.tone}>{item.limit}</Badge>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      {/* 管理员账号管理 */}
      <SectionCard
        title="Admin Accounts"
        subtitle="所有具备后台访问权限的账户"
        icon={ShieldCheck}
        right={
          <Badge tone="gold">
            {adminData ? `${adminData.total} accounts` : '...'}
          </Badge>
        }
      >
        {adminsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : adminData && adminData.list.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>管理员</TH>
                <TH>手机号</TH>
                <TH>注册来源</TH>
                <TH>注册时间</TH>
              </TR>
            </THead>
            <TBody>
              {adminData.list.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/20 bg-gold/10">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UsersIcon className="h-4 w-4 text-gold/70" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ivory">
                          {u.nickname || '—'}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gold/80">
                          ADMIN
                        </p>
                      </div>
                    </div>
                  </TD>
                  <TD>{u.phone || '—'}</TD>
                  <TD>
                    <Badge tone="neutral">{u.registerSource}</Badge>
                  </TD>
                  <TD>{formatDateTime(u.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-ash">
            <ShieldOff className="mb-3 h-10 w-10 text-gold/20" />
            <p className="text-sm">尚未配置管理员账号</p>
          </div>
        )}
      </SectionCard>

      {/* 系统日志 */}
      <SectionCard
        title="Activity Log"
        subtitle="最近的系统操作与安全事件（演示数据）"
        icon={Lock}
        right={<Badge tone="neutral">最近 24 小时</Badge>}
      >
        <ol className="relative space-y-4 border-l border-gold/10 pl-6">
          {MOCK_LOGS.map((log) => {
            const meta = LOG_TYPE_META[log.type];
            const Icon = meta.icon;
            return (
              <li key={log.id} className="relative">
                {/* 时间轴节点 */}
                <span
                  aria-hidden
                  className="absolute -left-[31px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gold/30 bg-noir-100 text-gold"
                >
                  <Icon className="h-3 w-3" strokeWidth={1.8} />
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <span className="text-sm text-ivory">{log.desc}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-ash">
                  <span className="uppercase tracking-[0.18em]">
                    @{log.operator}
                  </span>
                  <span>·</span>
                  <span>{formatDateTime(log.at)}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </SectionCard>
    </div>
  );
}

// ==================== 内部小组件 ====================

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  right,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={
        'rounded-xl border border-gold/10 bg-white/[0.03] backdrop-blur-sm ' +
        (className ?? '')
      }
    >
      <header className="flex items-center justify-between border-b border-gold/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-gold/20 bg-noir-100 text-gold">
            <Icon className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <div>
            <h2 className="font-display text-lg tracking-tight text-ivory">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-ash">{subtitle}</p>}
          </div>
        </div>
        {right}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  icon: LucideIcon;
  valueRight?: ReactNode;
  mono?: boolean;
}

function InfoRow({ label, value, icon: Icon, valueRight, mono }: InfoRowProps) {
  return (
    <div className="rounded-lg border border-gold/10 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ash">
        <Icon className="h-3.5 w-3.5 text-gold/70" />
        {label}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p
          className={
            'truncate text-ivory ' + (mono ? 'font-mono text-xs' : 'text-sm')
          }
          title={value}
        >
          {value}
        </p>
        {valueRight}
      </div>
    </div>
  );
}

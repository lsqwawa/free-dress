import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users as UsersIcon,
  Shirt,
  Palette,
  Camera,
  Heart,
  Shield,
  Phone,
  Calendar,
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import { Button, Badge, Select, Dialog, Skeleton } from '@/components/ui';
import { formatDateTime } from '@/utils';

// ==================== 常量 ====================

const ROLE_BADGE_TONE: Record<string, 'neutral' | 'gold' | 'info'> = {
  USER: 'neutral',
  VIP: 'gold',
  ADMIN: 'info',
};

// ==================== 用户详情页 ====================

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [roleDialog, setRoleDialog] = useState<{ open: boolean; newRole: string }>({
    open: false,
    newRole: '',
  });

  // 获取用户详情
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminApi.getUser(id!),
    enabled: !!id,
  });

  // 修改角色
  const updateRoleMutation = useMutation({
    mutationFn: (newRole: string) => adminApi.updateUserRole(id!, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleDialog({ open: false, newRole: '' });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ash">
        <UsersIcon className="h-16 w-16 text-gold/20 mb-4" />
        <p className="text-lg">用户不存在</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/users')}>
          返回列表
        </Button>
      </div>
    );
  }

  const counts = user._count || { clothes: 0, outfits: 0, tryOnResults: 0, favorites: 0 };

  return (
    <div className="space-y-6">
      {/* 面包屑 & 操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/users')}
            className="rounded-md p-2 text-ash transition-colors hover:bg-white/5 hover:text-ivory"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl text-ivory tracking-tight">用户详情</h1>
            <p className="text-xs text-ash mt-0.5">ID: {user.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Shield className="h-3.5 w-3.5" />}
            onClick={() => setRoleDialog({ open: true, newRole: user.role })}
          >
            修改角色
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
            返回列表
          </Button>
        </div>
      </div>

      {/* 用户信息卡片 */}
      <div className="glass-panel rounded-xl p-6 hover:border-gold/20 transition-all">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* 头像 */}
          <div className="h-24 w-24 rounded-full border-2 border-gold/40 bg-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <UsersIcon className="h-10 w-10 text-gold/60" />
            )}
          </div>

          {/* 基本信息 */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-xl text-ivory">{user.nickname || '未设置昵称'}</h2>
              <Badge tone={ROLE_BADGE_TONE[user.role] || 'neutral'}>{user.role}</Badge>
              <RegisterSourceBadge source={user.registerSource} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoItem icon={Phone} label="手机号" value={user.phone || '未绑定'} />
              <InfoItem icon={Calendar} label="注册时间" value={formatDateTime(user.createdAt)} />
              <InfoItem icon={Calendar} label="最后更新" value={formatDateTime(user.updatedAt)} />
              <InfoItem
                icon={UsersIcon}
                label="微信绑定"
                value={user.wechatUnionId ? '已绑定' : '未绑定'}
              />
            </div>

            {user.wechatNickname && (
              <p className="text-xs text-ash">
                微信昵称：{user.wechatNickname}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 数据统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <CountCard icon={Shirt} label="衣物数量" value={counts.clothes} />
        <CountCard icon={Palette} label="搭配数量" value={counts.outfits} />
        <CountCard icon={Camera} label="试穿次数" value={counts.tryOnResults} />
        <CountCard icon={Heart} label="收藏数量" value={counts.favorites} />
      </div>

      {/* 修改角色 Dialog */}
      <Dialog
        open={roleDialog.open}
        onClose={() => setRoleDialog({ open: false, newRole: '' })}
        title="修改用户角色"
        description={`当前用户：${user.nickname}`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleDialog({ open: false, newRole: '' })}
            >
              取消
            </Button>
            <Button
              size="sm"
              loading={updateRoleMutation.isPending}
              disabled={roleDialog.newRole === user.role}
              onClick={() => updateRoleMutation.mutate(roleDialog.newRole)}
            >
              确认修改
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3 border border-gold/5">
            <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UsersIcon className="h-5 w-5 text-gold/60" />
              )}
            </div>
            <div>
              <p className="text-sm text-ivory font-medium">{user.nickname}</p>
              <p className="text-xs text-ash">{user.phone || '无手机号'}</p>
            </div>
            <Badge tone={ROLE_BADGE_TONE[user.role] || 'neutral'} className="ml-auto">
              当前：{user.role}
            </Badge>
          </div>

          <Select
            label="新角色"
            value={roleDialog.newRole}
            options={[
              { label: 'USER — 普通用户', value: 'USER' },
              { label: 'VIP — 会员用户', value: 'VIP' },
              { label: 'ADMIN — 管理员', value: 'ADMIN' },
            ]}
            onChange={(e) => setRoleDialog((prev) => ({ ...prev, newRole: e.target.value }))}
          />

          {updateRoleMutation.isError && (
            <p className="text-xs text-danger">
              操作失败：{(updateRoleMutation.error as Error)?.message || '未知错误'}
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
}

// ==================== 子组件 ====================

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gold/50" />
      <span className="text-ash text-xs">{label}：</span>
      <span className="text-ivory text-sm">{value}</span>
    </div>
  );
}

function CountCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="glass-panel rounded-xl border-l-2 border-l-gold/60 p-5 hover:border-gold/20 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ash">{label}</p>
          <p className="mt-2 text-3xl font-display text-gold-400">{value.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-gold/10 p-2.5">
          <Icon className="h-5 w-5 text-gold" />
        </div>
      </div>
    </div>
  );
}

function RegisterSourceBadge({ source }: { source: string }) {
  const map: Record<string, { label: string; tone: 'gold' | 'info' | 'neutral' }> = {
    PHONE: { label: '手机注册', tone: 'neutral' },
    WECHAT_APP: { label: '微信App', tone: 'info' },
    WECHAT_MP: { label: '小程序', tone: 'gold' },
  };
  const info = map[source] || { label: source, tone: 'neutral' as const };
  return <Badge tone={info.tone}>{info.label}</Badge>;
}

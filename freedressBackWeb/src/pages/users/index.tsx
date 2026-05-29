import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Download,
  Eye,
  Users as UsersIcon,
  Shield,
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import {
  Button,
  Input,
  Select,
  Badge,
  Dialog,
  Skeleton,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@/components/ui';
import { formatDateTime } from '@/utils';
import type { User } from '@/types';

// ==================== 常量 ====================

const ROLE_OPTIONS = [
  { label: '全部角色', value: '' },
  { label: 'USER', value: 'USER' },
  { label: 'VIP', value: 'VIP' },
  { label: 'ADMIN', value: 'ADMIN' },
];

const SOURCE_OPTIONS = [
  { label: '全部来源', value: '' },
  { label: '手机注册', value: 'PHONE' },
  { label: '微信App', value: 'WECHAT_APP' },
  { label: '小程序', value: 'WECHAT_MP' },
];

const PAGE_SIZE_OPTIONS = [
  { label: '10条/页', value: '10' },
  { label: '20条/页', value: '20' },
  { label: '50条/页', value: '50' },
];

const ROLE_BADGE_TONE: Record<string, 'neutral' | 'gold' | 'info'> = {
  USER: 'neutral',
  VIP: 'gold',
  ADMIN: 'info',
};

// ==================== 用户列表页 ====================

export default function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 同步筛选状态
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const registerSource = searchParams.get('registerSource') || '';

  // 搜索输入框本地状态
  const [searchInput, setSearchInput] = useState(search);

  // 修改角色弹窗
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user: User | null; newRole: string }>({
    open: false,
    user: null,
    newRole: '',
  });

  // 更新 URL search params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, val]) => {
        if (val) params.set(key, val);
        else params.delete(key);
      });
      // 筛选变化时重置页码
      if (!('page' in updates)) params.set('page', '1');
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // 获取用户列表
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, pageSize, search, role, registerSource }],
    queryFn: () =>
      adminApi.listUsers({ page, pageSize, search: search || undefined, role: role || undefined, registerSource: registerSource || undefined }),
  });

  // 修改角色 mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, newRole }: { id: string; newRole: string }) =>
      adminApi.updateUserRole(id, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleDialog({ open: false, user: null, newRole: '' });
    },
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="font-display text-3xl text-ivory tracking-tight">用户管理</h1>
        <p className="mt-1 text-sm text-ash">账号、角色与注册信息管理</p>
      </div>

      {/* 工具栏 */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* 搜索 */}
          <div className="w-64">
            <Input
              placeholder="搜索手机号/昵称…"
              leftIcon={<Search className="h-4 w-4" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateParams({ search: searchInput });
              }}
            />
          </div>

          {/* 角色筛选 */}
          <div className="w-36">
            <Select
              value={role}
              options={ROLE_OPTIONS}
              onChange={(e) => updateParams({ role: e.target.value })}
            />
          </div>

          {/* 来源筛选 */}
          <div className="w-36">
            <Select
              value={registerSource}
              options={SOURCE_OPTIONS}
              onChange={(e) => updateParams({ registerSource: e.target.value })}
            />
          </div>

          {/* 搜索按钮 */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => updateParams({ search: searchInput })}
          >
            搜索
          </Button>

          {/* 导出 */}
          <div className="ml-auto">
            <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              导出
            </Button>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : data && data.list.length > 0 ? (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>用户</TH>
                  <TH>手机号</TH>
                  <TH>角色</TH>
                  <TH>注册来源</TH>
                  <TH>注册时间</TH>
                  <TH>操作</TH>
                </TR>
              </THead>
              <TBody>
                {data.list.map((user) => (
                  <TR key={user.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <UsersIcon className="h-4 w-4 text-gold/60" />
                          )}
                        </div>
                        <span className="text-ivory text-sm font-medium">{user.nickname || '-'}</span>
                      </div>
                    </TD>
                    <TD>{user.phone || '-'}</TD>
                    <TD>
                      <Badge tone={ROLE_BADGE_TONE[user.role] || 'neutral'}>{user.role}</Badge>
                    </TD>
                    <TD>
                      <RegisterSourceBadge source={user.registerSource} />
                    </TD>
                    <TD>{formatDateTime(user.createdAt)}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="rounded-md p-1.5 text-ash transition-colors hover:bg-white/5 hover:text-ivory"
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setRoleDialog({ open: true, user, newRole: user.role })
                          }
                          className="rounded-md p-1.5 text-ash transition-colors hover:bg-white/5 hover:text-gold"
                          title="修改角色"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            {/* 分页 */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gold/10 px-6 py-4">
              <span className="text-xs text-ash">
                共 {data.total} 条记录
              </span>
              <div className="flex items-center gap-3">
                <div className="w-28">
                  <Select
                    value={String(pageSize)}
                    options={PAGE_SIZE_OPTIONS}
                    onChange={(e) => updateParams({ pageSize: e.target.value, page: '1' })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="rounded-md px-3 py-1.5 text-xs text-ash transition-colors hover:bg-white/5 hover:text-ivory disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="px-3 text-xs text-ivory">
                    {page} / {totalPages || 1}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                    className="rounded-md px-3 py-1.5 text-xs text-ash transition-colors hover:bg-white/5 hover:text-ivory disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-ash">
            <UsersIcon className="h-12 w-12 text-gold/20 mb-3" />
            <p className="text-sm">暂无用户数据</p>
          </div>
        )}
      </div>

      {/* 修改角色 Dialog */}
      <Dialog
        open={roleDialog.open}
        onClose={() => setRoleDialog({ open: false, user: null, newRole: '' })}
        title="修改用户角色"
        description="变更后将立即生效"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleDialog({ open: false, user: null, newRole: '' })}
            >
              取消
            </Button>
            <Button
              size="sm"
              loading={updateRoleMutation.isPending}
              disabled={roleDialog.newRole === roleDialog.user?.role}
              onClick={() => {
                if (roleDialog.user) {
                  updateRoleMutation.mutate({
                    id: roleDialog.user.id,
                    newRole: roleDialog.newRole,
                  });
                }
              }}
            >
              确认修改
            </Button>
          </>
        }
      >
        {roleDialog.user && (
          <div className="space-y-4">
            {/* 用户信息 */}
            <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3 border border-gold/5">
              <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden">
                {roleDialog.user.avatarUrl ? (
                  <img src={roleDialog.user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UsersIcon className="h-5 w-5 text-gold/60" />
                )}
              </div>
              <div>
                <p className="text-sm text-ivory font-medium">{roleDialog.user.nickname}</p>
                <p className="text-xs text-ash">{roleDialog.user.phone || '无手机号'}</p>
              </div>
              <Badge tone={ROLE_BADGE_TONE[roleDialog.user.role] || 'neutral'} className="ml-auto">
                {roleDialog.user.role}
              </Badge>
            </div>

            {/* 角色选择 */}
            <Select
              label="新角色"
              value={roleDialog.newRole}
              options={[
                { label: 'USER — 普通用户', value: 'USER' },
                { label: 'VIP — 会员用户', value: 'VIP' },
                { label: 'ADMIN — 管理员', value: 'ADMIN' },
              ]}
              onChange={(e) =>
                setRoleDialog((prev) => ({ ...prev, newRole: e.target.value }))
              }
            />

            {updateRoleMutation.isError && (
              <p className="text-xs text-danger">
                操作失败：{(updateRoleMutation.error as Error)?.message || '未知错误'}
              </p>
            )}
          </div>
        )}
      </Dialog>
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

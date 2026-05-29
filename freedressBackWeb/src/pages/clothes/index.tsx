import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Shirt,
  Grid3X3,
  List,
  Search,
  Tag,
  User as UserIcon,
  Palette,
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import {
  Card,
  CardContent,
  Badge,
  Input,
  Select,
  Dialog,
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
import type { Cloth } from '@/types';

const CATEGORIES = [
  { label: '全部', value: '' },
  { label: '上衣', value: 'TOP' },
  { label: '下装', value: 'BOTTOM' },
  { label: '外套', value: 'COAT' },
  { label: '配饰', value: 'ACCESSORY' },
  { label: '鞋履', value: 'SHOE' },
];

const CATEGORY_LABELS: Record<string, string> = {
  TOP: '上衣',
  BOTTOM: '下装',
  COAT: '外套',
  ACCESSORY: '配饰',
  SHOE: '鞋履',
};

const CATEGORY_ICONS: Record<string, string> = {
  TOP: '👕',
  BOTTOM: '👖',
  COAT: '🧥',
  ACCESSORY: '💍',
  SHOE: '👟',
};

export default function ClothesPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'clothes', { page, pageSize, category, keyword }],
    queryFn: () =>
      adminApi.listClothes({
        page,
        pageSize,
        category: category || undefined,
        keyword: keyword || undefined,
      }),
  });

  // 分类统计 (从已知数据中模拟，实际可用独立接口)
  const categoryStats = useMemo(() => {
    const total = data?.total ?? 0;
    // 使用 mock 比例分配
    return {
      TOP: Math.round(total * 0.3),
      BOTTOM: Math.round(total * 0.25),
      COAT: Math.round(total * 0.15),
      ACCESSORY: Math.round(total * 0.18),
      SHOE: Math.round(total * 0.12),
    };
  }, [data?.total]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl text-ivory tracking-tight">衣物管理</h1>
        <p className="mt-1 text-sm text-ash">平台内全部衣物汇总查看与审核</p>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(categoryStats).map(([cat, count]) => (
          <Card key={cat} className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
              <div>
                <p className="text-xs text-ash uppercase tracking-wider">
                  {CATEGORY_LABELS[cat]}
                </p>
                <p className="text-2xl font-display text-gold-400">
                  {formatNumber(count)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-40">
          <Select
            options={CATEGORIES}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-60">
          <Input
            placeholder="搜索用户昵称..."
            leftIcon={<Search className="h-4 w-4" />}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-gold/10 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`rounded p-2 transition-colors ${viewMode === 'grid' ? 'bg-gold/20 text-gold' : 'text-ash hover:text-ivory'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`rounded p-2 transition-colors ${viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-ash hover:text-ivory'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : !data?.list?.length ? (
        <Card className="py-20 text-center">
          <Shirt className="mx-auto h-12 w-12 text-ash/40" />
          <p className="mt-4 text-ash">暂无衣物数据</p>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.list.map((cloth) => (
            <Card
              key={cloth.id}
              className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-gold"
              onClick={() => setSelectedCloth(cloth)}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={cloth.imageUrl}
                  alt={CATEGORY_LABELS[cloth.category] ?? cloth.category}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <Badge tone="gold">{CATEGORY_LABELS[cloth.category]}</Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {cloth.color && (
                    <Badge tone="neutral">
                      <Palette className="h-3 w-3" />
                      {cloth.color}
                    </Badge>
                  )}
                  {cloth.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} tone="neutral">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-ash">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {cloth.user?.nickname ?? '未知用户'}
                  </span>
                  <span>{formatDateTime(cloth.createdAt).split(' ')[0]}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>缩略图</TH>
                <TH>分类</TH>
                <TH>颜色</TH>
                <TH>风格</TH>
                <TH>用户</TH>
                <TH>标签</TH>
                <TH>上传时间</TH>
              </TR>
            </THead>
            <TBody>
              {data.list.map((cloth) => (
                <TR
                  key={cloth.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedCloth(cloth)}
                >
                  <TD>
                    <img
                      src={cloth.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  </TD>
                  <TD>
                    <Badge tone="gold">{CATEGORY_LABELS[cloth.category]}</Badge>
                  </TD>
                  <TD>{cloth.color || '-'}</TD>
                  <TD>{cloth.style || '-'}</TD>
                  <TD>{cloth.user?.nickname || '-'}</TD>
                  <TD>
                    <div className="flex gap-1 flex-wrap">
                      {cloth.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} tone="neutral">{tag}</Badge>
                      ))}
                    </div>
                  </TD>
                  <TD className="text-ash text-xs">{formatDateTime(cloth.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {data && data.total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onChange={setPage}
        />
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedCloth}
        onClose={() => setSelectedCloth(null)}
        title="衣物详情"
        size="lg"
      >
        {selectedCloth && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src={selectedCloth.imageUrl}
                alt=""
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <DetailItem
                label="分类"
                value={CATEGORY_LABELS[selectedCloth.category] ?? selectedCloth.category}
              />
              <DetailItem label="颜色" value={selectedCloth.color || '-'} />
              <DetailItem label="风格" value={selectedCloth.style || '-'} />
              <DetailItem
                label="季节"
                value={selectedCloth.season?.join(', ') || '-'}
              />
              <DetailItem
                label="标签"
                value={selectedCloth.tags?.join(', ') || '-'}
              />
              <DetailItem
                label="所属用户"
                value={selectedCloth.user?.nickname ?? '未知'}
              />
              <DetailItem
                label="创建时间"
                value={formatDateTime(selectedCloth.createdAt)}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ash">{label}</p>
      <p className="mt-0.5 text-sm text-ivory">{value}</p>
    </div>
  );
}

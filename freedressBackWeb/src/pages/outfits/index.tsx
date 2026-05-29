import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Palette,
  Search,
  Image as ImageIcon,
  User as UserIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '@/api/admin';
import {
  Card,
  CardContent,
  Badge,
  Input,
  Dialog,
  Skeleton,
  Pagination,
} from '@/components/ui';
import { formatDateTime } from '@/utils';
import type { Outfit } from '@/types';

export default function OutfitsPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'outfits', { page, pageSize, keyword }],
    queryFn: () =>
      adminApi.listOutfits({
        page,
        pageSize,
        keyword: keyword || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl text-ivory tracking-tight">搭配管理</h1>
        <p className="mt-1 text-sm text-ash">AI 与用户生成的搭配方案管理</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
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
        <div className="ml-auto text-xs text-ash">
          共 {data?.total ?? 0} 套搭配
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : !data?.list?.length ? (
        <Card className="py-20 text-center">
          <Palette className="mx-auto h-12 w-12 text-ash/40" />
          <p className="mt-4 text-ash">暂无搭配数据</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.list.map((outfit) => (
            <Card
              key={outfit.id}
              className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-gold"
              onClick={() => setSelectedOutfit(outfit)}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-noir-100">
                {outfit.imageUrl ? (
                  <img
                    src={outfit.imageUrl}
                    alt="搭配效果"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-ash/20" />
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                {/* AI Description */}
                {outfit.aiDescription && (
                  <p className="text-sm text-ivory/80 line-clamp-2 leading-relaxed">
                    <Sparkles className="mr-1 inline h-3 w-3 text-gold-400" />
                    {outfit.aiDescription}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {outfit.style && <Badge tone="gold">{outfit.style}</Badge>}
                  {outfit.occasion && <Badge tone="info">{outfit.occasion}</Badge>}
                  {outfit.outfitClothes && (
                    <Badge tone="neutral">
                      <Layers className="h-3 w-3" />
                      {outfit.outfitClothes.length} 件
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-ash pt-1 border-t border-gold/5">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {outfit.user?.nickname ?? '未知用户'}
                  </span>
                  <span>{formatDateTime(outfit.createdAt).split(' ')[0]}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
        open={!!selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        title="搭配详情"
        size="lg"
      >
        {selectedOutfit && (
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-video overflow-hidden rounded-lg bg-noir-100">
              {selectedOutfit.imageUrl ? (
                <img
                  src={selectedOutfit.imageUrl}
                  alt="搭配效果"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-ash/20" />
                </div>
              )}
            </div>

            {/* AI Description */}
            {selectedOutfit.aiDescription && (
              <div className="rounded-lg bg-white/[0.02] border border-gold/10 p-4">
                <p className="text-xs uppercase tracking-wider text-ash mb-2">
                  <Sparkles className="mr-1 inline h-3 w-3 text-gold-400" />
                  AI 描述
                </p>
                <p className="text-sm text-ivory/90 leading-relaxed">
                  {selectedOutfit.aiDescription}
                </p>
              </div>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetaItem label="风格" value={selectedOutfit.style || '-'} />
              <MetaItem label="场合" value={selectedOutfit.occasion || '-'} />
              <MetaItem label="用户" value={selectedOutfit.user?.nickname || '-'} />
              <MetaItem label="创建时间" value={formatDateTime(selectedOutfit.createdAt)} />
            </div>

            {/* Outfit Clothes */}
            {selectedOutfit.outfitClothes && selectedOutfit.outfitClothes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-ash mb-3">
                  关联衣物 ({selectedOutfit.outfitClothes.length})
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {selectedOutfit.outfitClothes.map((oc) => (
                    <div
                      key={oc.clothId}
                      className="aspect-square overflow-hidden rounded-lg border border-gold/10 bg-noir-100"
                    >
                      {oc.cloth?.imageUrl ? (
                        <img
                          src={oc.cloth.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-ash/20" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ash">{label}</p>
      <p className="mt-0.5 text-sm text-ivory">{value}</p>
    </div>
  );
}

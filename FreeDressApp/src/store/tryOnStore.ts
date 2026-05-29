import { create } from 'zustand';
import { TryOnResult } from '../types';
import { createTryon, getTryonResults, getTryonStatus, CreateTryonData, TryOnStatus } from '../api/tryon';

interface TryOnWithOutfit extends TryOnResult {
  outfit?: {
    id: string;
    style?: string;
    outfitClothes: { cloth: any; order: number }[];
  };
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  failReason?: string;
  message?: string;
}

interface TryOnState {
  results: TryOnWithOutfit[];
  currentResult: TryOnWithOutfit | null;
  isLoading: boolean;
  isGenerating: boolean;
  pollingId: string | null;
  progress: number;

  fetchResults: () => Promise<void>;
  generateTryon: (data: CreateTryonData) => Promise<TryOnWithOutfit>;
  pollStatus: (id: string) => void;
  stopPolling: () => void;
  setCurrentResult: (result: TryOnWithOutfit | null) => void;
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

export const useTryOnStore = create<TryOnState>((set, get) => ({
  results: [],
  currentResult: null,
  isLoading: false,
  isGenerating: false,
  pollingId: null,
  progress: 0,

  fetchResults: async () => {
    set({ isLoading: true });
    try {
      const res = await getTryonResults();
      set({ results: res.data });
    } catch (e) {
      console.error('获取试穿记录失败:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  generateTryon: async (data: CreateTryonData) => {
    set({ isGenerating: true, progress: 0 });
    try {
      const res = await createTryon(data);
      const result = res.data;
      set({
        results: [result, ...get().results],
        currentResult: result,
      });

      // 如果返回的是异步任务（PENDING/PROCESSING），自动开始轮询
      if (result.status === 'PENDING' || result.status === 'PROCESSING') {
        get().pollStatus(result.id);
      } else {
        // 同步返回（去重命中或Mock模式）
        set({ isGenerating: false });
      }

      return result;
    } catch (e) {
      set({ isGenerating: false });
      throw e;
    }
  },

  pollStatus: (id: string) => {
    // 清理旧轮询
    get().stopPolling();
    set({ pollingId: id });

    pollTimer = setInterval(async () => {
      try {
        const res = await getTryonStatus(id);
        const status = res.data;
        set({ progress: status.progress });

        if (status.status === 'COMPLETED') {
          // 完成：更新结果并停止轮询
          const currentResult = get().currentResult;
          if (currentResult && currentResult.id === id) {
            set({
              currentResult: {
                ...currentResult,
                resultImageUrl: status.resultImageUrl || currentResult.resultImageUrl,
                status: 'COMPLETED',
                progress: 100,
              },
              isGenerating: false,
              progress: 100,
            });
          }
          get().stopPolling();
          // 刷新列表获取完整数据
          get().fetchResults();
        } else if (status.status === 'FAILED') {
          // 失败：停止轮询并通知
          set({ isGenerating: false, progress: 0 });
          const currentResult = get().currentResult;
          if (currentResult && currentResult.id === id) {
            set({
              currentResult: {
                ...currentResult,
                status: 'FAILED',
                failReason: status.failReason,
              },
            });
          }
          get().stopPolling();
        }
      } catch (e) {
        // 网络错误不中断轮询，等待下一次
      }
    }, 3000);
  },

  stopPolling: () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    set({ pollingId: null });
  },

  setCurrentResult: (result) => set({ currentResult: result }),
}));

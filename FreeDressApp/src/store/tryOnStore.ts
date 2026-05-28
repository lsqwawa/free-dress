import { create } from 'zustand';
import { TryOnResult } from '../types';
import { createTryon, getTryonResults, CreateTryonData } from '../api/tryon';

interface TryOnWithOutfit extends TryOnResult {
  outfit?: {
    id: string;
    style?: string;
    outfitClothes: { cloth: any; order: number }[];
  };
}

interface TryOnState {
  results: TryOnWithOutfit[];
  currentResult: TryOnWithOutfit | null;
  isLoading: boolean;
  isGenerating: boolean;

  fetchResults: () => Promise<void>;
  generateTryon: (data: CreateTryonData) => Promise<TryOnWithOutfit>;
  setCurrentResult: (result: TryOnWithOutfit | null) => void;
}

export const useTryOnStore = create<TryOnState>((set, get) => ({
  results: [],
  currentResult: null,
  isLoading: false,
  isGenerating: false,

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
    set({ isGenerating: true });
    try {
      const res = await createTryon(data);
      const result = res.data;
      set({
        results: [result, ...get().results],
        currentResult: result,
      });
      return result;
    } finally {
      set({ isGenerating: false });
    }
  },

  setCurrentResult: (result) => set({ currentResult: result }),
}));

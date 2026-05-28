import { create } from 'zustand';
import { Cloth, ClothCategory } from '../types';
import {
  getClothes,
  createCloth,
  updateCloth,
  deleteCloth,
  getCategoryStats,
  CreateClothData,
  UpdateClothData,
} from '../api/clothes';

interface CategoryStats {
  TOP: number;
  BOTTOM: number;
  COAT: number;
  ACCESSORY: number;
  SHOE: number;
}

interface WardrobeState {
  clothes: Cloth[];
  categoryStats: CategoryStats;
  isLoading: boolean;
  activeCategory: string;

  setActiveCategory: (category: string) => void;
  fetchClothes: (category?: ClothCategory) => Promise<void>;
  fetchStats: () => Promise<void>;
  addCloth: (data: CreateClothData) => Promise<void>;
  editCloth: (id: string, data: UpdateClothData) => Promise<void>;
  removeCloth: (id: string) => Promise<void>;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  clothes: [],
  categoryStats: { TOP: 0, BOTTOM: 0, COAT: 0, ACCESSORY: 0, SHOE: 0 },
  isLoading: false,
  activeCategory: 'ALL',

  setActiveCategory: (category) => set({ activeCategory: category }),

  fetchClothes: async (category?: ClothCategory) => {
    set({ isLoading: true });
    try {
      const res = await getClothes(category);
      set({ clothes: res.data });
    } catch (e) {
      console.error('获取衣物列表失败:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await getCategoryStats();
      set({ categoryStats: res.data });
    } catch (e) {
      console.error('获取分类统计失败:', e);
    }
  },

  addCloth: async (data: CreateClothData) => {
    const res = await createCloth(data);
    set({ clothes: [res.data, ...get().clothes] });
    get().fetchStats();
  },

  editCloth: async (id: string, data: UpdateClothData) => {
    const res = await updateCloth(id, data);
    set({
      clothes: get().clothes.map((c) => (c.id === id ? res.data : c)),
    });
  },

  removeCloth: async (id: string) => {
    await deleteCloth(id);
    set({ clothes: get().clothes.filter((c) => c.id !== id) });
    get().fetchStats();
  },
}));

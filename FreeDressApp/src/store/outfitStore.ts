import { create } from 'zustand';
import { Outfit } from '../types';
import {
  createOutfit,
  getOutfits,
  deleteOutfit,
  toggleFavorite,
  getFavorites,
  CreateOutfitData,
} from '../api/outfits';

interface OutfitWithClothes extends Outfit {
  outfitClothes: { cloth: any; order: number }[];
  isFavorited?: boolean;
  _count?: { favorites: number };
}

interface OutfitState {
  outfits: OutfitWithClothes[];
  favorites: OutfitWithClothes[];
  isLoading: boolean;
  currentOutfit: OutfitWithClothes | null;

  fetchOutfits: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  createNewOutfit: (data: CreateOutfitData) => Promise<OutfitWithClothes>;
  removeOutfit: (id: string) => Promise<void>;
  toggleFav: (outfitId: string) => Promise<void>;
  setCurrentOutfit: (outfit: OutfitWithClothes | null) => void;
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
  outfits: [],
  favorites: [],
  isLoading: false,
  currentOutfit: null,

  fetchOutfits: async () => {
    set({ isLoading: true });
    try {
      const res = await getOutfits();
      set({ outfits: res.data });
    } catch (e) {
      console.error('获取搭配列表失败:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFavorites: async () => {
    try {
      const res = await getFavorites();
      set({ favorites: res.data });
    } catch (e) {
      console.error('获取收藏失败:', e);
    }
  },

  createNewOutfit: async (data: CreateOutfitData) => {
    const res = await createOutfit(data);
    const outfit = res.data;
    set({ outfits: [outfit, ...get().outfits], currentOutfit: outfit });
    return outfit;
  },

  removeOutfit: async (id: string) => {
    await deleteOutfit(id);
    set({
      outfits: get().outfits.filter((o) => o.id !== id),
      currentOutfit: get().currentOutfit?.id === id ? null : get().currentOutfit,
    });
  },

  toggleFav: async (outfitId: string) => {
    const res = await toggleFavorite(outfitId);
    const { favorited } = res.data;
    set({
      outfits: get().outfits.map((o) =>
        o.id === outfitId ? { ...o, isFavorited: favorited } : o,
      ),
      currentOutfit:
        get().currentOutfit?.id === outfitId
          ? { ...get().currentOutfit!, isFavorited: favorited }
          : get().currentOutfit,
    });
  },

  setCurrentOutfit: (outfit) => set({ currentOutfit: outfit }),
}));

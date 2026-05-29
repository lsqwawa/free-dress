import apiClient from './axios';
import { ApiResponse, Outfit } from '../types';

interface OutfitWithClothes extends Outfit {
  outfitClothes: { cloth: any; order: number }[];
  isFavorited?: boolean;
  _count?: { favorites: number };
}

export interface CreateOutfitData {
  clothIds: string[];
  style?: string;
  occasion?: string;
  aiDescription?: string;
}

export const createOutfit = async (data: CreateOutfitData): Promise<ApiResponse<OutfitWithClothes>> => {
  return apiClient.post('/outfits', data) as Promise<ApiResponse<OutfitWithClothes>>;
};

export const getOutfits = async (): Promise<ApiResponse<OutfitWithClothes[]>> => {
  return apiClient.get('/outfits') as Promise<ApiResponse<OutfitWithClothes[]>>;
};

export const getOutfit = async (id: string): Promise<ApiResponse<OutfitWithClothes>> => {
  return apiClient.get(`/outfits/${id}`) as Promise<ApiResponse<OutfitWithClothes>>;
};

export const deleteOutfit = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete(`/outfits/${id}`) as Promise<ApiResponse<{ message: string }>>;
};

export const toggleFavorite = async (outfitId: string): Promise<ApiResponse<{ favorited: boolean }>> => {
  return apiClient.post(`/outfits/${outfitId}/favorite`) as Promise<ApiResponse<{ favorited: boolean }>>;
};

export const getFavorites = async (): Promise<ApiResponse<OutfitWithClothes[]>> => {
  return apiClient.get('/outfits/favorites') as Promise<ApiResponse<OutfitWithClothes[]>>;
};

export interface RecommendationResult {
  clothIds: string[];
  style: string;
  occasion: string;
  reason: string;
  score: number;
}

export const getRecommendations = async (options?: {
  scene?: string;
  season?: string;
  count?: number;
}): Promise<ApiResponse<RecommendationResult[]>> => {
  return apiClient.get('/outfits/recommendations', { params: options }) as Promise<ApiResponse<RecommendationResult[]>>;
};

import apiClient from './axios';
import { ApiResponse, TryOnResult } from '../types';

interface TryOnWithOutfit extends TryOnResult {
  outfit?: {
    id: string;
    style?: string;
    outfitClothes: { cloth: any; order: number }[];
  };
}

export interface CreateTryonData {
  personImageUrl: string;
  outfitId: string;
}

export const createTryon = async (data: CreateTryonData): Promise<ApiResponse<TryOnWithOutfit>> => {
  return apiClient.post('/tryon', data) as Promise<ApiResponse<TryOnWithOutfit>>;
};

export const getTryonResults = async (): Promise<ApiResponse<TryOnWithOutfit[]>> => {
  return apiClient.get('/tryon') as Promise<ApiResponse<TryOnWithOutfit[]>>;
};

export const getTryonResult = async (id: string): Promise<ApiResponse<TryOnWithOutfit>> => {
  return apiClient.get(`/tryon/${id}`) as Promise<ApiResponse<TryOnWithOutfit>>;
};

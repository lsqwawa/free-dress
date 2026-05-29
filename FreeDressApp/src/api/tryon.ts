import apiClient from './axios';
import { ApiResponse, TryOnResult } from '../types';

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

export interface CreateTryonData {
  personImageUrl: string;
  outfitId: string;
}

export interface TryOnStatus {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  resultImageUrl?: string;
  failReason?: string;
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

export const getTryonStatus = async (id: string): Promise<ApiResponse<TryOnStatus>> => {
  return apiClient.get(`/tryon/${id}/status`) as Promise<ApiResponse<TryOnStatus>>;
};

export interface AiUsageSummary {
  tryon: { used: number; limit: number; remaining: number };
  recommend: { used: number; limit: number; remaining: number };
  date: string;
  role: string;
}

export const getTryonQuota = async (): Promise<ApiResponse<AiUsageSummary>> => {
  return apiClient.get('/tryon/quota') as Promise<ApiResponse<AiUsageSummary>>;
};

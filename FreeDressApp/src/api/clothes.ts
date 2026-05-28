import apiClient from './axios';
import { ApiResponse, Cloth, ClothCategory } from '../types';

interface CategoryStats {
  TOP: number;
  BOTTOM: number;
  COAT: number;
  ACCESSORY: number;
  SHOE: number;
}

export interface CreateClothData {
  imageUrl: string;
  category: ClothCategory;
  color?: string;
  style?: string;
  season?: string[];
  tags?: string[];
}

export interface UpdateClothData {
  imageUrl?: string;
  category?: ClothCategory;
  color?: string;
  style?: string;
  season?: string[];
  tags?: string[];
}

export const createCloth = async (data: CreateClothData): Promise<ApiResponse<Cloth>> => {
  return apiClient.post('/clothes', data) as Promise<ApiResponse<Cloth>>;
};

export const getClothes = async (category?: ClothCategory): Promise<ApiResponse<Cloth[]>> => {
  const params = category ? { category } : {};
  return apiClient.get('/clothes', { params }) as Promise<ApiResponse<Cloth[]>>;
};

export const getCloth = async (id: string): Promise<ApiResponse<Cloth>> => {
  return apiClient.get(`/clothes/${id}`) as Promise<ApiResponse<Cloth>>;
};

export const updateCloth = async (id: string, data: UpdateClothData): Promise<ApiResponse<Cloth>> => {
  return apiClient.put(`/clothes/${id}`, data) as Promise<ApiResponse<Cloth>>;
};

export const deleteCloth = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete(`/clothes/${id}`) as Promise<ApiResponse<{ message: string }>>;
};

export const getCategoryStats = async (): Promise<ApiResponse<CategoryStats>> => {
  return apiClient.get('/clothes/stats/categories') as Promise<ApiResponse<CategoryStats>>;
};

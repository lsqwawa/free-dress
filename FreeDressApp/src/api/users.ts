import apiClient from './axios';
import { ApiResponse, User } from '../types';

interface UserWithCounts extends User {
  _count: {
    clothes: number;
    outfits: number;
    favorites: number;
  };
}

interface UserStats {
  clothesCount: number;
  outfitsCount: number;
  favoritesCount: number;
  tryOnCount: number;
}

export const getUserProfile = async (): Promise<ApiResponse<UserWithCounts>> => {
  return apiClient.get('/users/profile') as Promise<ApiResponse<UserWithCounts>>;
};

export const updateUserProfile = async (
  data: { nickname?: string; avatarUrl?: string },
): Promise<ApiResponse<User>> => {
  return apiClient.put('/users/profile', data) as Promise<ApiResponse<User>>;
};

export const getUserStats = async (): Promise<ApiResponse<UserStats>> => {
  return apiClient.get('/users/stats') as Promise<ApiResponse<UserStats>>;
};

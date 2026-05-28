import apiClient from './axios';
import { ApiResponse } from '../types';

export const uploadImage = async (uri: string): Promise<ApiResponse<{ url: string }>> => {
  const formData = new FormData();

  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);

  return apiClient.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<ApiResponse<{ url: string }>>;
};

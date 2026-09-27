import { apiClient } from '@/lib/api-client';
import { ApiResponse, EntityImage, ImageOwnerType } from '@/types';

export async function uploadEntityImages(
  ownerType: ImageOwnerType,
  ownerId: string,
  files: File[]
): Promise<EntityImage[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const { data } = await apiClient.post<ApiResponse<EntityImage[]>>(
    `/images/${ownerType}/${ownerId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data;
}
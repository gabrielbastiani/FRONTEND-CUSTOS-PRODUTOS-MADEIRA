import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, EntityImage, ImageOwnerType } from '@/types';

function queryKey(ownerType: ImageOwnerType, ownerId: string) {
  return ['images', ownerType, ownerId];
}

export function useEntityImages(ownerType: ImageOwnerType, ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? queryKey(ownerType, ownerId) : ['images', ownerType, 'pending'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<EntityImage[]>>(
        `/images/${ownerType}/${ownerId}`
      );
      return data.data;
    },
    enabled: !!ownerId,
  });
}

export function useUploadImages(ownerType: ImageOwnerType, ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (!ownerId) throw new Error('Salve o cadastro antes de enviar imagens.');

      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const { data } = await apiClient.post<ApiResponse<EntityImage[]>>(
        `/images/${ownerType}/${ownerId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },
    onSuccess: () => {
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: queryKey(ownerType, ownerId) });
      }
      toast.success('Imagem(ns) enviada(s) com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteImage(ownerType: ImageOwnerType, ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      await apiClient.delete(`/images/${imageId}`);
    },
    onSuccess: () => {
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: queryKey(ownerType, ownerId) });
      }
      toast.success('Imagem removida.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
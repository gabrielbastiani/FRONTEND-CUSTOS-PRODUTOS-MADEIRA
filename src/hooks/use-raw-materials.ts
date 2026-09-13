import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, RawMaterial } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = ['raw-materials'];

export function useRawMaterials() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<RawMaterial[]>>('/raw-materials');
      return data.data;
    },
  });
}

export function useCreateRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<RawMaterial>) => {
      const { data } = await apiClient.post<ApiResponse<RawMaterial>>('/raw-materials', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Matéria-prima criada com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<RawMaterial> }) => {
      const { data } = await apiClient.put<ApiResponse<RawMaterial>>(`/raw-materials/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Matéria-prima atualizada com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/raw-materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Matéria-prima removida com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
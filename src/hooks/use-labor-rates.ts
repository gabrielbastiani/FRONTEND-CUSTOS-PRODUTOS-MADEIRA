import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, LaborRate } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = ['labor-rates'];

export function useLaborRates() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<LaborRate[]>>('/labor-rates');
      return data.data;
    },
  });
}

export function useCreateLaborRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<LaborRate>) => {
      const { data } = await apiClient.post<ApiResponse<LaborRate>>('/labor-rates', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Mão de obra criada com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateLaborRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<LaborRate> }) => {
      const { data } = await apiClient.put<ApiResponse<LaborRate>>(`/labor-rates/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Mão de obra atualizada com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteLaborRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/labor-rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Mão de obra removida com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
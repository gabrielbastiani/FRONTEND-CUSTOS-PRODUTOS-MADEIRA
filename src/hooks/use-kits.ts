import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, Kit, KitPricingResult } from '@/types';

const QUERY_KEY = ['kits'];

interface KitItemPayload {
  productId: string;
  quantity: number;
}

interface KitPayload {
  name: string;
  description?: string;
  marginPercent: number;
  overheadPercent?: number;
  items: KitItemPayload[];
}

export function useKits() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Kit[]>>('/kits');
      return data.data;
    },
  });
}

export function useKit(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Kit>>(`/kits/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useKitCost(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'calculate'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<KitPricingResult>>(
        `/kits/${id}/calculate`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateKit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: KitPayload) => {
      const { data } = await apiClient.post<ApiResponse<Kit>>('/kits', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Kit criado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateKit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<KitPayload> }) => {
      const { data } = await apiClient.put<ApiResponse<Kit>>(`/kits/${id}`, payload);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, variables.id] });
      toast.success('Kit atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteKit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/kits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Kit removido com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
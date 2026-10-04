import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, FixedCost } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = ['fixed-costs'];

export function useFixedCosts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<FixedCost[]>>('/fixed-costs');
      return data.data;
    },
  });
}

interface CreateFixedCostPayload {
  name: string;
  monthlyValue: number;
  isActive?: boolean;
}

type UpdateFixedCostPayload = Partial<CreateFixedCostPayload>;

export function useCreateFixedCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFixedCostPayload) => {
      const { data } = await apiClient.post<ApiResponse<FixedCost>>(
        '/fixed-costs',
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Custo fixo adicionado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateFixedCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFixedCostPayload;
    }) => {
      const { data } = await apiClient.put<ApiResponse<FixedCost>>(
        `/fixed-costs/${id}`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Custo fixo atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteFixedCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/fixed-costs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Custo fixo removido com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
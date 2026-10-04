import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, WorkshopSettings } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = ['workshop-settings'];

export function useWorkshopSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<WorkshopSettings>>(
        '/workshop-settings'
      );
      return data.data;
    },
  });
}

export function useUpdateWorkshopSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { monthlyProductiveHours: number }) => {
      const { data } = await apiClient.put<ApiResponse<WorkshopSettings>>(
        '/workshop-settings',
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      // A capacidade produtiva mensal afeta o cálculo de qualquer produto que
      // esteja usando rateio automático de overhead, então é necessário
      // invalidar também as queries de cálculo de custo de produtos já
      // carregadas em cache, para que reflitam o novo valor imediatamente.
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Configurações da oficina atualizadas com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, ProductionRecord, RawMaterial } from '@/types';
import { toast } from 'sonner';

export function useProductionHistory(productId: string) {
  return useQuery({
    queryKey: ['products', productId, 'production-history'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ProductionRecord[]>>(
        `/products/${productId}/production-history`
      );
      return data.data;
    },
    enabled: !!productId,
  });
}

export function useProduceProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quantityProduced: number) => {
      const { data } = await apiClient.post<ApiResponse<ProductionRecord>>(
        `/products/${productId}/produce`,
        { quantityProduced }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId, 'production-history'] });
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      toast.success('Produção registrada e estoque atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLowStockMaterials() {
  return useQuery({
    queryKey: ['raw-materials', 'low-stock'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<RawMaterial[]>>('/raw-materials/low-stock');
      return data.data;
    },
  });
}
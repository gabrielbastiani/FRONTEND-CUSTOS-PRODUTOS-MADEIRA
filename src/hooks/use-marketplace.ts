import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, Marketplace, MarketplaceCalculationResult } from '@/types';

const QUERY_KEY = ['marketplaces'];

interface CalculatePriceInput {
  marketplaceId: string;
  productCost: number;
  desiredMarginPercent: number;
}

export function useCalculateMarketplacePrice() {
  return useMutation({
    mutationFn: async (input: CalculatePriceInput) => {
      const { data } = await apiClient.post<ApiResponse<MarketplaceCalculationResult>>(
        '/marketplace/calculate',
        input
      );
      return data.data;
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMarketplaces() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Marketplace[]>>('/marketplace');
      return data.data;
    },
  });
}

interface MarketplacePayload {
  name: string;
  commissionPercent: number;
  commissionCapValue: number | null;
  fixedFeeValue: number | null;
  lowValueFeeTiers: { maxValue: number; fee: number }[] | null;
}

export function useCreateMarketplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MarketplacePayload) => {
      const { data } = await apiClient.post<ApiResponse<Marketplace>>(
        '/marketplace',
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Marketplace adicionado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateMarketplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<MarketplacePayload>;
    }) => {
      const { data } = await apiClient.put<ApiResponse<Marketplace>>(
        `/marketplace/${id}`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Marketplace atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteMarketplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/marketplace/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Marketplace removido com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
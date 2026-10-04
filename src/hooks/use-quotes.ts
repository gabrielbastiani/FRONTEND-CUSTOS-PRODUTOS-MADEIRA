import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, Quote, DiscountType } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = ['quotes'];

export function useQuotes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Quote[]>>('/quotes');
      return data.data;
    },
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Quote>>(`/quotes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

interface CreateQuotePayload {
  clientName: string;
  clientContact?: string;
  discountType: DiscountType;
  discountValue: number;
  validityDays: number;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateQuotePayload) => {
      const { data } = await apiClient.post<ApiResponse<Quote>>('/quotes', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Orçamento criado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

interface UpdateQuoteItemPayload {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface UpdateQuotePayload {
  clientName: string;
  clientContact?: string | null;
  discountType: DiscountType;
  discountValue: number;
  validityDays: number;
  notes?: string | null;
  items: UpdateQuoteItemPayload[];
}

export function useUpdateQuote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateQuotePayload) => {
      const { data } = await apiClient.put<ApiResponse<Quote>>(`/quotes/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] });
      toast.success('Orçamento atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Orçamento removido com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function downloadQuotePdfUrl(id: string): string {
  return `${apiClient.defaults.baseURL}/quotes/${id}/pdf`;
}
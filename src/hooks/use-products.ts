import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  ApiResponse,
  Product,
  PricingResult,
  ProductCostSnapshot,
} from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = ['products'];

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product[]>>('/products');
      return data.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useProductCost(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'calculate'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PricingResult>>(`/products/${id}/calculate`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useProductHistory(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ProductCostSnapshot[]>>(`/products/${id}/history`);
      return data.data;
    },
    enabled: !!id,
  });
}

interface OverheadItemPayload {
  name: string;
  value: number;
}

interface CreateProductPayload {
  name: string;
  description?: string;
  marginPercent?: number;
  overheadItems?: OverheadItemPayload[];
  materials?: { rawMaterialId: string; quantityUsed: number; wastePercent?: number }[];
  labors?: { laborRateId: string; hoursSpent: number }[];
}

interface UpdateProductDetailsPayload {
  name?: string;
  description?: string;
  marginPercent?: number;
  overheadItems?: OverheadItemPayload[];
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { data } = await apiClient.post<ApiResponse<Product>>('/products', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Produto criado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Product> }) => {
      const { data } = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, variables.id] });
      toast.success('Produto atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Produto removido com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddMaterialToProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      rawMaterialId: string;
      quantityUsed: number;
      wastePercent?: number;
    }) => {
      const { data } = await apiClient.post(`/products/${productId}/materials`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId, 'calculate'] });
      toast.success('Matéria-prima adicionada ao produto.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRemoveMaterialFromProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (materialItemId: string) => {
      await apiClient.delete(`/products/${productId}/materials/${materialItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId, 'calculate'] });
      toast.success('Matéria-prima removida do produto.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddLaborToProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { laborRateId: string; hoursSpent: number }) => {
      const { data } = await apiClient.post(`/products/${productId}/labors`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId, 'calculate'] });
      toast.success('Mão de obra adicionada ao produto.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRemoveLaborFromProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (laborItemId: string) => {
      await apiClient.delete(`/products/${productId}/labors/${laborItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId, 'calculate'] });
      toast.success('Mão de obra removida do produto.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSaveCostSnapshot(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/products/${productId}/calculate/save`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId, 'history'] });
      toast.success('Precificação salva no histórico.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateProductDetails(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProductDetailsPayload) => {
      const { data } = await apiClient.put<ApiResponse<Product>>(
        `/products/${productId}`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, productId, 'calculate'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Produto atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
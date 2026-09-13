import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, Supplier } from '@/types';
import { toast } from 'sonner';

const QUERY_KEY = ['suppliers'];

export function useSuppliers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Supplier[]>>('/suppliers');
      return data.data;
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Supplier>) => {
      const { data } = await apiClient.post<ApiResponse<Supplier>>('/suppliers', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Fornecedor criado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Supplier> }) => {
      const { data } = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Fornecedor atualizado com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Fornecedor removido com sucesso.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { RawMaterial, MaterialSupplier } from '@/types';

// --- Hooks de Matéria-Prima (dados gerais) ---

interface CreateRawMaterialPayload {
  name: string;
  description?: string;
  usageUnit: string;
  conversionFactor: number;
  stockQty?: number;
  minStockAlert?: number;
  supplierId?: string;
  purchaseUnit?: string;
  purchaseQty?: number;
  purchasePrice?: number;
}

interface UpdateRawMaterialPayload {
  name?: string;
  description?: string;
  usageUnit?: string;
  conversionFactor?: number;
  stockQty?: number;
  minStockAlert?: number;
}

export function useRawMaterials() {
  return useQuery({
    queryKey: ['raw-materials'],
    queryFn: async () => {
      const { data } = await apiClient.get('/raw-materials');
      return data.data as RawMaterial[];
    },
  });
}

export function useRawMaterial(id: string, enabled = true) {
  return useQuery({
    queryKey: ['raw-materials', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/raw-materials/${id}`);
      return data.data as RawMaterial;
    },
    enabled: enabled && !!id,
  });
}

export function useLowStockMaterials() {
  return useQuery({
    queryKey: ['raw-materials', 'low-stock'],
    queryFn: async () => {
      const { data } = await apiClient.get('/raw-materials/low-stock');
      return data.data as RawMaterial[];
    },
  });
}

export function useCreateRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRawMaterialPayload) => {
      const { data } = await apiClient.post('/raw-materials', payload);
      return data.data as RawMaterial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
    },
  });
}

export function useUpdateRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRawMaterialPayload;
    }) => {
      const { data } = await apiClient.put(`/raw-materials/${id}`, payload);
      return data.data as RawMaterial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
    },
  });
}

export function useDeleteRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/raw-materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
    },
  });
}

// --- Hooks de Estoque ---

interface RestockPayload {
  quantity: number;
  note?: string;
  supplierId?: string;
}

interface AdjustStockPayload {
  quantity: number;
  note: string;
}

export function useRestockRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: RestockPayload;
    }) => {
      const { data } = await apiClient.post(`/raw-materials/${id}/restock`, payload);
      return data.data as RawMaterial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
    },
  });
}

export function useAdjustRawMaterialStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: AdjustStockPayload;
    }) => {
      const { data } = await apiClient.post(
        `/raw-materials/${id}/adjust-stock`,
        payload
      );
      return data.data as RawMaterial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
    },
  });
}

export function useRawMaterialStockMovements(rawMaterialId: string, enabled = true) {
  return useQuery({
    queryKey: ['raw-materials', rawMaterialId, 'stock-movements'],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/raw-materials/${rawMaterialId}/stock-movements`
      );
      return data.data;
    },
    enabled: enabled && !!rawMaterialId,
  });
}

// --- Hooks de Fornecedores da Matéria-Prima ---

interface AddSupplierPayload {
  supplierId: string;
  purchaseUnit: string;
  purchaseQty: number;
  purchasePrice: number;
  isDefault?: boolean;
}

interface UpdateSupplierPayload {
  purchaseUnit?: string;
  purchaseQty?: number;
  purchasePrice?: number;
}

export function useAddMaterialSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      materialId,
      payload,
    }: {
      materialId: string;
      payload: AddSupplierPayload;
    }) => {
      const { data } = await apiClient.post(
        `/raw-materials/${materialId}/suppliers`,
        payload
      );
      return data.data as MaterialSupplier;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      queryClient.invalidateQueries({
        queryKey: ['raw-materials', variables.materialId],
      });
    },
  });
}

export function useUpdateMaterialSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      materialId,
      supplierEntryId,
      payload,
    }: {
      materialId: string;
      supplierEntryId: string;
      payload: UpdateSupplierPayload;
    }) => {
      const { data } = await apiClient.put(
        `/raw-materials/${materialId}/suppliers/${supplierEntryId}`,
        payload
      );
      return data.data as MaterialSupplier;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      queryClient.invalidateQueries({
        queryKey: ['raw-materials', variables.materialId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'material-price-history',
          variables.materialId,
          variables.supplierEntryId,
        ],
      });
    },
  });
}

export function useRemoveMaterialSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      materialId,
      supplierEntryId,
    }: {
      materialId: string;
      supplierEntryId: string;
    }) => {
      await apiClient.delete(
        `/raw-materials/${materialId}/suppliers/${supplierEntryId}`
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      queryClient.invalidateQueries({
        queryKey: ['raw-materials', variables.materialId],
      });
    },
  });
}

export function useSetDefaultMaterialSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      materialId,
      supplierEntryId,
    }: {
      materialId: string;
      supplierEntryId: string;
    }) => {
      const { data } = await apiClient.patch(
        `/raw-materials/${materialId}/suppliers/${supplierEntryId}/set-default`
      );
      return data.data as MaterialSupplier;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      queryClient.invalidateQueries({
        queryKey: ['raw-materials', variables.materialId],
      });
    },
  });
}

export function useMaterialPriceHistory(
  materialId: string,
  supplierEntryId: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['material-price-history', materialId, supplierEntryId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/raw-materials/${materialId}/suppliers/${supplierEntryId}/price-history`
      );
      return data.data as {
        materialSupplier: MaterialSupplier;
        averagePrice: string;
        priceAlert: string | null;
      };
    },
    enabled,
  });
}
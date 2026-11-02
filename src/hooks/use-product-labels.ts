import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface GenerateLabelsPayload {
  productIds: string[];
  format: 'SMALL' | 'CARD';
}

export function useGenerateProductLabels() {
  return useMutation({
    mutationFn: async (payload: GenerateLabelsPayload) => {
      const response = await apiClient.post('/products/labels/generate', payload, {
        responseType: 'blob',
      });
      return response.data as Blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'etiquetas-produtos.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Dá tempo ao navegador de iniciar o download antes de liberar o Blob.
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
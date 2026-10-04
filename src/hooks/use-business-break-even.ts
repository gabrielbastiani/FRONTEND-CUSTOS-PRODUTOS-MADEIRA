import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, BusinessBreakEvenResult } from '@/types';

export function useBusinessBreakEven() {
  return useQuery({
    queryKey: ['business-break-even'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<BusinessBreakEvenResult>>(
        '/business-break-even'
      );
      return data.data;
    },
  });
}
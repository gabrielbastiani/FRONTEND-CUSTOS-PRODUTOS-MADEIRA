import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, ProfitGoalResult } from '@/types';
import { toast } from 'sonner';

export function useCalculateProfitGoal() {
  return useMutation({
    mutationFn: async (desiredProfit: number) => {
      const { data } = await apiClient.post<ApiResponse<ProfitGoalResult>>(
        '/profit-goal/calculate',
        { desiredProfit }
      );
      return data.data;
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
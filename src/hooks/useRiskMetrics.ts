
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RiskMetrics } from '@/types/database';
import { fetchRiskMetrics, updateRiskMetrics, subscribeToRiskMetrics } from '@/services/RiskMetricsService';
import { toast } from 'sonner';

export const useRiskMetrics = () => {
  const queryClient = useQueryClient();
  
  // Fetch risk metrics
  const { 
    data: riskMetrics, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['riskMetrics'],
    queryFn: fetchRiskMetrics,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update risk metrics mutation
  const updateMetricsMutation = useMutation({
    mutationFn: updateRiskMetrics,
    onSuccess: (updatedMetrics) => {
      queryClient.invalidateQueries({ queryKey: ['riskMetrics'] });
      toast.success('Risk metrics updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update risk metrics', {
        description: error.message
      });
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToRiskMetrics((newMetrics) => {
      queryClient.invalidateQueries({ queryKey: ['riskMetrics'] });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return {
    riskMetrics,
    isLoading,
    error,
    refetch,
    updateRiskMetrics: updateMetricsMutation.mutate,
    isUpdating: updateMetricsMutation.isPending
  };
};

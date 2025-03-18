
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SecurityAlert } from '@/types/database';
import { fetchSecurityAlerts, createSecurityAlert, updateAlertStatus, subscribeToSecurityAlerts } from '@/services/SecurityAlertService';
import { toast } from 'sonner';

export const useSecurityAlerts = (limit: number = 10, status?: string) => {
  const queryClient = useQueryClient();
  
  // Fetch security alerts
  const { 
    data: alerts, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['securityAlerts', limit, status],
    queryFn: () => fetchSecurityAlerts(limit, status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create security alert mutation
  const createAlertMutation = useMutation({
    mutationFn: createSecurityAlert,
    onSuccess: (newAlert) => {
      queryClient.invalidateQueries({ queryKey: ['securityAlerts'] });
      toast.success('Security alert created');
    },
    onError: (error: any) => {
      toast.error('Failed to create security alert', {
        description: error.message
      });
    }
  });

  // Update alert status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'acknowledged' | 'resolved' | 'dismissed' }) => 
      updateAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityAlerts'] });
      toast.success('Alert status updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update alert status', {
        description: error.message
      });
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToSecurityAlerts((newAlert) => {
      queryClient.invalidateQueries({ queryKey: ['securityAlerts'] });
      
      // Show toast for new alerts
      if (newAlert.status === 'new') {
        toast.error(newAlert.title, {
          description: newAlert.description,
          duration: 10000,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return {
    alerts: alerts || [],
    isLoading,
    error,
    refetch,
    createAlert: createAlertMutation.mutate,
    updateAlertStatus: updateStatusMutation.mutate,
    isCreating: createAlertMutation.isPending,
    isUpdating: updateStatusMutation.isPending
  };
};

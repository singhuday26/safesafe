
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@/types/database';
import { fetchTransactions, createTransaction, updateTransactionStatus, subscribeToTransactions } from '@/services/TransactionService';
import { toast } from 'sonner';

export const useTransactions = (limit: number = 10, startDate?: Date, endDate?: Date, status?: string) => {
  const queryClient = useQueryClient();
  
  // Fetch transactions
  const { 
    data: transactions, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['transactions', limit, startDate, endDate, status],
    queryFn: () => fetchTransactions(limit, startDate, endDate, status),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create transaction', {
        description: error.message
      });
    }
  });

  // Update transaction status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'approved' | 'declined' | 'flagged' }) => 
      updateTransactionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction status updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update transaction status', {
        description: error.message
      });
    }
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToTransactions((newTransaction) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.info('New transaction activity', {
        description: `Transaction ${newTransaction.transaction_number} was updated`
      });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return {
    transactions: transactions || [],
    isLoading,
    error,
    refetch,
    createTransaction: createMutation.mutate,
    updateTransactionStatus: updateStatusMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending
  };
};

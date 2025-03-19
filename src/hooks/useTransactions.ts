import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@/types/database';
import { fetchTransactions } from '@/services/TransactionService';

export const useTransactions = (limit: number = 10, startDate?: Date, endDate?: Date, status?: string) => {
  // Fetch transactions
  const { 
    data: transactions = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', limit, startDate?.toISOString(), endDate?.toISOString(), status],
    queryFn: () => fetchTransactions(limit, startDate, endDate, status),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  return {
    transactions,
    isLoading,
    error,
    refetch
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { toast } from 'sonner';

// Types
export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'flagged';
  merchant: string;
  created_at: string;
  risk_score: number;
  ip_address?: string;
  location_data?: {
    country?: string;
    city?: string;
  };
  device_info?: {
    isEmulator?: boolean;
    browser?: string;
    os?: string;
  };
  metadata?: Record<string, any>;
}

export interface FraudAlert {
  id: string;
  transaction_id: string;
  detection_method: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface TransactionFilterOptions {
  status?: string;
  transaction_type?: string;
  min_amount?: number;
  max_amount?: number;
  min_risk_score?: number;
  start_date?: string;
  end_date?: string;
  account_id?: string;
  limit?: number;
}

export interface AlertFilterOptions {
  status?: string;
  severity?: string;
  detection_method?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export function useTransactions(filters: TransactionFilterOptions = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase.from('transactions').select('*');
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }
      
      if (filters.min_amount) {
        query = query.gte('amount', filters.min_amount);
      }
      
      if (filters.max_amount) {
        query = query.lte('amount', filters.max_amount);
      }
      
      if (filters.min_risk_score) {
        query = query.gte('risk_score', filters.min_risk_score);
      }
      
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      
      if (filters.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as Transaction[];
    },
  });
}

export function useFraudAlerts(filters: AlertFilterOptions = {}) {
  return useQuery({
    queryKey: ['fraud_alerts', filters],
    queryFn: async () => {
      let query = supabase.from('fraud_alerts').select(`
        *,
        transactions(*)
      `);
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      
      if (filters.detection_method) {
        query = query.eq('detection_method', filters.detection_method);
      }
      
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as (FraudAlert & { transactions: Transaction })[];
    },
  });
}

export function useUpdateFraudAlertStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      alertId, 
      status, 
      resolution_notes 
    }: { 
      alertId: string; 
      status: 'investigating' | 'resolved' | 'false_positive';
      resolution_notes?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('fraud_alerts')
        .update({ 
          status, 
          resolved_by: status === 'resolved' || status === 'false_positive' ? user.user?.id : null,
          resolution_notes: resolution_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud_alerts'] });
      toast.success('Alert status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update alert status: ${error.message}`);
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'status' | 'risk_score'>) => {
      const { data, error } = await supabase.functions.invoke('transaction-verification', {
        body: { transaction: transactionData }
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || data.error || 'Failed to create transaction');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction processed successfully');
    },
    onError: (error) => {
      toast.error(`Transaction failed: ${error.message}`);
    },
  });
}

export function useGetStructuringPatterns() {
  return useQuery({
    queryKey: ['structuring_patterns'],
    queryFn: async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data, error } = await supabase.rpc(
        'get_structuring_patterns',
        { 
          p_timeframe: threeDaysAgo.toISOString(),
          p_min_transactions: 5,
          p_max_amount: 1000
        }
      );
      
      if (error) {
        throw error;
      }
      
      return data;
    },
  });
}

export function useGetVelocityPatterns() {
  return useQuery({
    queryKey: ['velocity_patterns'],
    queryFn: async () => {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const { data, error } = await supabase.rpc(
        'get_velocity_patterns',
        { 
          p_timeframe: oneHourAgo.toISOString(),
          p_min_transactions: 3
        }
      );
      
      if (error) {
        throw error;
      }
      
      return data;
    },
  });
}

export function useRunDemoDataCreation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('create_demo_data');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Demo data created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create demo data: ${error.message}`);
    },
  });
}

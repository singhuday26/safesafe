
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../client';
import { Transaction } from '@/types/database';
import { getRiskLevel, getRiskColor } from '@/utils/fraudDetectionUtils';

// Define types for our fraud detection system
export interface RiskScore {
  overall: number;
  categories: {
    amount: number;
    velocity: number;
    location: number;
    behavior: number;
    device: number;
  };
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  description: string;
  impact: number;
  category: 'amount' | 'velocity' | 'location' | 'behavior' | 'device';
}

export interface FraudAlert {
  id: string;
  transaction_id: string;
  detection_method: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  details: any;
  created_at: string;
  updated_at: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  condition_json: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Hook to get user's risk profile
export const useRiskProfile = (userId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['riskProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('risk_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
  
  return {
    riskProfile: data,
    isLoading,
    error,
    refetch,
    riskLevel: data ? getRiskLevel(data.overall_risk_score) : 'unknown',
    riskColor: data ? getRiskColor(data.overall_risk_score) : 'bg-gray-500 text-gray-500'
  };
};

// Hook to get recent transactions with risk scores
export const useRecentRiskyTransactions = (userId?: string, limit: number = 10) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['riskyTransactions', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('risk_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data as unknown as Transaction[];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  return {
    transactions: data || [],
    isLoading,
    error,
    refetch,
    highRiskCount: data ? data.filter(t => t.risk_score >= 70).length : 0,
    mediumRiskCount: data ? data.filter(t => t.risk_score >= 40 && t.risk_score < 70).length : 0
  };
};

// Hook to get fraud alerts for a user
export const useFraudAlerts = (userId?: string, status?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['fraudAlerts', userId, status],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('fraud_alerts')
        .select(`
          *,
          transactions!inner(*)
        `)
        .eq('transactions.user_id', userId)
        .order('created_at', { ascending: false });
        
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      return data.map(alert => ({
        ...alert,
        transaction: alert.transactions
      })) as unknown as (FraudAlert & { transaction: Transaction })[];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds for fraud alerts
  });
  
  // Real-time subscription for new fraud alerts
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('fraud-alerts-changes')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fraud_alerts',
          filter: `transactions.user_id=eq.${userId}`
        }, 
        (payload) => {
          // Notify the user of new fraud alert
          toast.error('Fraud Alert Detected', {
            description: `A new fraud alert has been created. Please review immediately.`,
          });
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);
  
  return {
    alerts: data || [],
    isLoading,
    error,
    refetch,
    criticalCount: data ? data.filter(a => a.severity === 'critical').length : 0,
    highCount: data ? data.filter(a => a.severity === 'high').length : 0,
    mediumCount: data ? data.filter(a => a.severity === 'medium').length : 0,
    lowCount: data ? data.filter(a => a.severity === 'low').length : 0
  };
};

// Hook to update fraud alert status
export const useUpdateFraudAlertStatus = () => {
  const mutation = useMutation({
    mutationFn: async ({ 
      alertId, 
      status, 
      notes 
    }: { 
      alertId: string; 
      status: 'investigating' | 'resolved' | 'false_positive'; 
      notes?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('fraud_alerts')
        .update({ 
          status,
          resolved_by: status === 'resolved' || status === 'false_positive' ? userId : null,
          resolution_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Log this action to audit logs
      await supabase.rpc('log_audit', {
        p_user_id: userId,
        p_action: `fraud_alert_${status}`,
        p_resource_type: 'fraud_alert',
        p_resource_id: alertId,
        p_metadata: { notes }
      });
      
      return data;
    },
    onSuccess: (data) => {
      toast.success('Alert Updated', {
        description: `Fraud alert status updated to ${data.status}`
      });
    },
    onError: (error) => {
      toast.error('Error Updating Alert', {
        description: error.message
      });
    }
  });
  
  return mutation;
};

// Hook for transaction verification
export const useVerifyTransaction = () => {
  const mutation = useMutation({
    mutationFn: async ({ 
      transactionData 
    }: { 
      transactionData: Partial<Transaction> 
    }) => {
      const { data, error } = await supabase.functions.invoke('transaction-verification', {
        body: { transaction: transactionData }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Transaction Verified', {
          description: `Transaction has been verified and processed.`
        });
      } else {
        toast.error('Transaction Failed', {
          description: data.message || 'Transaction could not be verified'
        });
      }
    },
    onError: (error) => {
      toast.error('Verification Error', {
        description: error.message
      });
    }
  });
  
  return mutation;
};

// Hook to get fraud rules
export const useFraudRules = (isAdmin: boolean = false) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['fraudRules', isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_rules')
        .select('*')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as unknown as FraudRule[];
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes for rules
  });
  
  return {
    rules: data || [],
    isLoading,
    error,
    refetch,
    activeRules: data ? data.filter(r => r.active).length : 0,
    inactiveRules: data ? data.filter(r => !r.active).length : 0
  };
};

// Hook to toggle fraud rule active status
export const useToggleFraudRule = () => {
  const mutation = useMutation({
    mutationFn: async ({ 
      ruleId, 
      active 
    }: { 
      ruleId: string; 
      active: boolean; 
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('fraud_rules')
        .update({ 
          active,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId)
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Log this action to audit logs
      await supabase.rpc('log_audit', {
        p_user_id: userId,
        p_action: active ? 'fraud_rule_activated' : 'fraud_rule_deactivated',
        p_resource_type: 'fraud_rule',
        p_resource_id: ruleId,
        p_metadata: { rule_name: data.name }
      });
      
      return data;
    },
    onSuccess: (data) => {
      toast.success('Rule Updated', {
        description: `Fraud rule "${data.name}" is now ${data.active ? 'active' : 'inactive'}`
      });
    },
    onError: (error) => {
      toast.error('Error Updating Rule', {
        description: error.message
      });
    }
  });
  
  return mutation;
};

// Hook to create a fraud rule
export const useCreateFraudRule = () => {
  const mutation = useMutation({
    mutationFn: async ({ 
      name,
      description,
      condition,
      severity
    }: { 
      name: string;
      description: string;
      condition: any;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('fraud_rules')
        .insert({ 
          name,
          description,
          condition_json: condition,
          severity,
          active: true,
          created_by: userId
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Log this action to audit logs
      await supabase.rpc('log_audit', {
        p_user_id: userId,
        p_action: 'fraud_rule_created',
        p_resource_type: 'fraud_rule',
        p_resource_id: data.id,
        p_metadata: { rule_name: name, severity }
      });
      
      return data;
    },
    onSuccess: (data) => {
      toast.success('Rule Created', {
        description: `New fraud rule "${data.name}" created successfully`
      });
    },
    onError: (error) => {
      toast.error('Error Creating Rule', {
        description: error.message
      });
    }
  });
  
  return mutation;
};

// Main hook that combines fraud detection capabilities
export const useFraudDetection = (userId?: string) => {
  const riskProfile = useRiskProfile(userId);
  const riskyTransactions = useRecentRiskyTransactions(userId);
  const fraudAlerts = useFraudAlerts(userId);
  const updateAlertStatus = useUpdateFraudAlertStatus();
  const verifyTransaction = useVerifyTransaction();
  
  return {
    riskProfile,
    riskyTransactions,
    fraudAlerts,
    updateAlertStatus,
    verifyTransaction,
    
    // Check if there are any critical alerts that need attention
    hasCriticalAlerts: fraudAlerts.alerts.some(alert => 
      alert.severity === 'critical' && alert.status === 'new'
    ),
    
    // Get system status
    systemStatus: {
      alertsRequiringAttention: fraudAlerts.alerts.filter(a => a.status === 'new').length,
      highRiskTransactionsToday: riskyTransactions.transactions.filter(
        t => t.risk_score >= 70 && new Date(t.created_at).toDateString() === new Date().toDateString()
      ).length,
      overallRiskScore: riskProfile.riskProfile?.overall_risk_score || 0,
      riskLevel: riskProfile.riskLevel
    }
  };
};
